const { generateFile, createBuildInfoEndpoint } = require('./utils/buildInfo');

function handleGenerateFile(args) {
  const filePath = args.filepath || './lib/build-info.json';
  console.log(`Generating build info f.ile at: ${filePath}`);
  generateFile(filePath);
}

function handleCreateEndpoint(args) {
  const buildInfoPath = args.buildInfoPath || './lib/build-info.json';
  console.log(`Creating endpoint using build info at: ${buildInfoPath}`);
  createBuildInfoEndpoint(buildInfoPath)
  console.log(
    'Endpoint creation complete. Implement server logic to expose this.',
  );
}

module.exports = { handleGenerateFile, handleCreateEndpoint };
