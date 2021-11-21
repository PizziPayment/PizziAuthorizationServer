import * as express from 'express'
import * as bodyParser from 'body-parser'

import { config } from './common/config'
import AuthenticationRouter from './authentication/routes.config'
import { initOrm } from 'pizzi-db'

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
  res.header('Access-Control-Expose-Headers', 'Content-Length')
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  } else {
    return next()
  }
})

AuthenticationRouter(app)

initOrm({
  host: config.database.host,
  name: config.database.name,
  password: config.database.password,
  port: Number(config.database.port),
  user: config.database.user,
  logging: false,
})
  .then(() => console.log('Orm synchronised'))
  .catch(() => {
    throw new Error("Can't connect to database")
  })

app.listen(config.port, () => {
  console.log(`API is listening on ${config.port}`)
})
