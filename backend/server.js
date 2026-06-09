import app        from "./src/app.js"
import connectDB  from "./src/config/db.js"
import config     from "./src/config/env.js"

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })
}).catch(err => {
  console.error("DB connection failed:", err)
  process.exit(1)
})
