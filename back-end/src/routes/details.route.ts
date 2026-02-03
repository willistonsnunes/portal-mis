import { Router } from "express";
import { getTickets, getChanges, getProblems, getTasks, getKnowledges, getSatisfactions } from '../controllers/details.controller.js'

const detailsRoute = Router();

detailsRoute.post('/ticketsDetails', getTickets)
detailsRoute.post('/changesDetails', getChanges)
detailsRoute.post('/problemsDetails', getProblems)
detailsRoute.post('/tasksDetails', getTasks)
detailsRoute.post('/knowledgesDetails', getKnowledges)
detailsRoute.post('/satisfactionsDetails', getSatisfactions)

export default detailsRoute;