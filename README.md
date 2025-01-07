# CurAItor

A decentralized AI-powered marketplace built on Lens Protocol that enables content distribution through intelligent curation. 

## Project Structure

The project consists of three main components:

### 1. Frontend (`/frontend`)
A Next.js application that provides the user interface for:
- Uploading and publishing new assets
- Viewing asset details and analysis
- Monitoring agent decisions
- Displaying real-time processing status

Key features:
- Real-time updates for transaction status
- AI-powered asset analysis
- Automatic embedding generation
- Integration with Lens Protocol storage

### 2. Agent (`/agent`)
A Node.js service that runs AI agents to analyze assets and make purchase decisions:
- Cartoon Collector Agent: Analyzes similarity to existing cartoon images
- Nature Collector Agent: Analyzes similarity to existing nature images

Features:
- Real-time event monitoring
- Automated decision making using similarity search
- Price analysis and comparison
- REST API for status queries

### 3. Smart Contracts (`/contracts`)
Solidity smart contracts for:
- Asset registration and management
- Transaction handling
- Agent interactions

### 4. Embeddings Backend (`/embeddings`)
A Node.js service that generates embeddings for images using Ollama:
- Converts images into high-dimensional vector representations
- Provides a REST API for embedding generation

Features:
- Express.js REST endpoints

## Installation

### Prerequisites
- Node.js v16 or higher
- Yarn package manager
- PostgreSQL database
- Google Cloud API key (for Gemini LLM)
- Ollama installed locally (for embeddings generation)

### Frontend Setup
```bash
cd frontend
yarn install
cp .env.example .env.local
# Configure your environment variables in .env.local
```

Required environment variables:
```
NEXT_PUBLIC_AGENT_CARTON_API_URL=http://localhost:4000
NEXT_PUBLIC_AGENT_NATURE_API_URL=http://localhost:4000
```

### Agent Setup
```bash
cd agent
yarn install
cp .env.example .env
# Configure your environment variables in .env
```

Required environment variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
GOOGLE_API_KEY=your_gemini_api_key
API_PORT=4000
```

### Database Setup
```bash
cd agent
yarn typeorm migration:run
```

### Embeddings Backend Setup
```bash
cd embeddings
yarn install
cp .env.example .env
```

Required environment variables for embeddings:
```
PORT=3001
OLLAMA_HOST=http://localhost:11434
MODEL_NAME=mxbai-embed-larg
```

### Starting the Embeddings Service
1. First, ensure Ollama is running and the mxbai-embed-larg model is pulled:
```bash
# Install Ollama from https://ollama.ai
ollama pull mxbai-embed-larg
ollama serve
```

2. Then start the embeddings service:
```bash
cd embeddings
yarn dev
```
The embeddings service will start on `http://localhost:3001`

### Embeddings API Endpoints

- `POST /api/embeddings`
  - Accepts btext description of image
  - Returns embedding vector for similarity search
  - Example request:
    ```json
    {
      "description": "A picture of a cat"
    }
    ```
  - Example response:
    ```json
    {
      "embeddings": [0.123, -0.456, ...],
      "dimensions": 768
    }
    ```

### Docker Support for Embeddings
```bash
cd embeddings
docker build -t embeddings-service .
docker run -p 3001:3001 embeddings-service
```

## Starting the Project

### 1. Start the Frontend
```bash
cd frontend
yarn dev
```
The frontend will be available at `http://localhost:3000`

### 2. Start the Agent Service
```bash
cd agent
yarn dev
```
The agent service will start on `http://localhost:4000`

## API Endpoints

### Agent Status API
- `GET /api/status/:transactionId?agentType=cartoon|nature`
  - Returns the analysis status and decision for a specific transaction
  - Response includes:
    - status: 'PENDING' | 'ANALYZED' | 'ERROR' | 'PURCHASED'
    - decision: boolean
    - feedback: string
    - errorMessage: string (if applicable)

## Development Notes

### Adding New Agents
1. Create a new agent type in `agent/src/types`
2. Implement the agent logic in `agent/src/agents`
3. Add the agent to the contract event listener
4. Update the frontend to display the new agent's status

### Smart Contract Interaction
The project uses ethers.js for blockchain interaction. Ensure you have:
- A wallet with sufficient GRASS tokens
- Correct network configuration (Lens Network Sepolia Testnet)
- Proper contract ABI configuration

### Smart contract deployments
- GHO - MockERC20: 0xC505C444f16fDA16b3955eF5B74F895B0064B34f
- AssetFactory: 0x4f5e4643501E4F18856ce9B90278025F92369C6B

## Troubleshooting

### Common Issues
1. **404 Agent Status Errors**: The first status check might fail as the transaction is being processed. The UI will automatically retry after 5 seconds.

2. **Transaction Failures**: Ensure you have:
   - Connected your wallet
   - Switched to Lens Network
   - Sufficient GRASS tokens

3. **Database Connection Issues**: Verify your PostgreSQL connection string and database existence