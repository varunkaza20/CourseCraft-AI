import express       from "express"
import cors          from "cors"
import helmet        from "helmet"
import authRoutes    from "./routes/auth.routes.js"
import curriculumRoutes from "./routes/curriculum.routes.js"
import courseRoutes  from "./routes/course.routes.js"
import outcomeRoutes from "./routes/outcome.routes.js"
import errorMiddleware  from "./middleware/error.middleware.js"
import config        from "./config/env.js"

const app = express()

app.use(helmet())

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}))
app.use(express.json())

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
)


app.use("/api/auth",       authRoutes)
app.use("/api/curriculum", curriculumRoutes)
app.use("/api/courses",    courseRoutes)
app.use("/api/outcomes",   outcomeRoutes)

app.use(errorMiddleware)

export default app
