FROM langchain/langgraphjs-api:20
ADD . /deps/agents
ENV LANGSERVE_GRAPHS='{"agent":"./src/react-agent/graph.ts:graph"}'
WORKDIR /deps/agents
RUN npm i
RUN (test ! -f /api/langgraph_api/js/build.mts && echo "Prebuild script not found, skipping") || tsx /api/langgraph_api/js/build.mts