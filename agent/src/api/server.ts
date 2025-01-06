import express, { RequestHandler } from 'express';
import cors from 'cors';
import { AppDataSource } from '../db/data-source';
import { AgentLog } from '../db/entities/AgentLog';

const app = express();
const port = process.env.API_PORT || 4000;

// Enable CORS
app.use(cors());
app.use(express.json());

interface StatusParams {
    transactionId: string;
}

const getStatus: RequestHandler<StatusParams> = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        const agentType = req.query.agentType as string || 'cartoon';

        console.log('Fetching status for:', { transactionId, agentType });

        const log = await AppDataSource
            .getRepository(AgentLog)
            .findOne({
                where: {
                    transactionId,
                    agentType
                }
            });

        console.log('Found log:', log);

        if (!log) {
            console.log('No log found for:', { transactionId, agentType });
            res.status(404).json({
                error: 'No analysis found for this transaction ID'
            });
            return;
        }

        res.json({
            status: log.status,
            decision: log.decision,
            feedback: log.feedback,
            errorMessage: log.errorMessage,
            createdAt: log.createdAt,
            updatedAt: log.updatedAt,
            transactionMint: log.transactionMint
        });
    } catch (error) {
        console.error('Error fetching analysis status:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Register the route handler
app.get('/api/status/:transactionId', getStatus);

export async function startServer() {
    try {
        // Start the server
        app.listen(port, () => {
            console.log(`API server listening on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
} 