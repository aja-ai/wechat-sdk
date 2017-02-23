import http from 'request-promise';

import config from './config';

const AJA_API = process.env.AJA_API;

function create(text, open_id, location) {
  return http.post(`${AJA_API}/`, {
    json: true,
    headers: {
      'X-SECRET': config('AJA_APP_SECRET'),
    },
    body: { text, open_id, location },
  });
}

function answer(session, key, value) {
  return http.put(`${AJA_API}/${session}`, {
    json: true,
    headers: {
      'X-SECRET': config('AJA_APP_SECRET'),
    },
    body: { key, value },
  });
}

export default function aja() {
  return async (req, res, next) => {
    const { weixin, wxsession } = req;
    const { sid, asking } = wxsession;

    switch (weixin.MsgType) {
      case 'event':
        if (weixin.Event == 'LOCATION') {
          wxsession.location = {
            lat: parseFloat(weixin.Latitude),
            lng: parseFloat(weixin.Longitude),
          };
          res.status(200).end();
        }
        break;
      case 'text':
      case 'voice':
        const text = weixin.Content || weixin.Recognition;
        if (sid && asking) {
          await replySession(text, req, res, next);
        } else {
          await createSession(text, req, res, next);
        }
        break;
      case 'location':
        const location = {
          lat: parseFloat(weixin.Location_X),
          lng: parseFloat(weixin.Location_Y),
        };
        if (sid && asking) {
          await replySession(location, req, res, next);
        } else {
          res.status(200).end();
        }
        break;
      default:
        next();
        break;
    }
  };
}

async function createSession(text, req, res, next) {
  const { weixin, wxsession } = req;
  const { location } = wxsession;

  try {
    const aja = await create(text, weixin.FromUserName, location);
    handleResponse(aja, req, res, next);
  } catch (e) {
    console.error('create session failed', e.stack);
    next(e);
  }
}

async function replySession(value, req, res, next) {
  const { wxsession } = req;
  const { sid, asking } = wxsession;

  try {
    const aja = await answer(sid, asking.question.name, value);
    handleResponse(aja, req, res, next);
  } catch (e) {
    console.error('reply session failed', e.stack);
    res.reply({ type: 'text', content: asking.text });
  }
}

function handleResponse(aja, req, res, next) {
  const { wxsession } = req;

  if (aja.meta.remains == 0) {
    wxsession.sid = undefined;
    wxsession.asking = undefined;

    if (aja.result) {
      return res.reply({ type: 'text', content: aja.result.text });
    }
  } else {
    const question = aja.data.questions[0];

    wxsession.sid = aja.id;
    wxsession.asking = question;

    return res.reply({ type: 'text', content: question.text });
  }

  res.status(400).end();
}
