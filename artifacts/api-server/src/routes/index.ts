import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wesalAuthRouter from "./wesal-auth";
import wesalInvitationsRouter from "./wesal-invitations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(wesalAuthRouter);
router.use(wesalInvitationsRouter);

export default router;
