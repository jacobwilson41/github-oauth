import express, {
  Request,
  Response,
} from 'express';
import axios from 'axios';
import cookieSession from 'cookie-session';
import { User } from './models/user'
import { clientId, clientSecret } from './secrets'

const app = express();
const keys = [process.env.COOKIE_KEY || 'asdf'];
const port = 4050;

app.use(
  cookieSession({
    keys,
  })
);

app.get('/auth/github', (req: Request, res: Response) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}`);
})

app.get('/auth/github/callback', async (req: Request, res: Response) => {
  req.session = {};
  const body = {
    client_id: clientId,
    client_secret: clientSecret,
    code: req.query.code
  };
  const opts = { headers: { accept: 'application/json' } };

  try {
    const response = await axios.post(`https://github.com/login/oauth/access_token`, body, opts);
    const token = response.data['access_token']
    const { data: { id } } = await axios.get('https://api.github.com/user', { headers: { authorization: `token ${token}` } });

    let user = await User.findOne({ githubProfile: id });
    if (!user) {
      user = new User({ githubProfile: id});
      await user.save();
    }

    req.session.id = id;
    res.json({ ok: 1 });

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})