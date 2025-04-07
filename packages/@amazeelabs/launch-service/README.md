# Launch Service

A command-line tool for launching services within [Turborepo](https://turbo.build/) chains.

## Installation

```bash
npm install -g @amazeelabs/launch-service
```

## Usage

### Start a service

```bash
launch-service start '<command>' <port>  [options]
```

Arguments:

- `<command>` - Required: The shell command to run
- `<port>` - Required: Port that the service will use (not a parameter passed to the script)

Options:

- `-r, --resources <resources>` - Optional: Additional resource to check for availability (e.g., "http://localhost:3000/health")
- `-t, --timeout <timeout>` - Optional: Milliseconds to wait for the service to become available.

The command performs the following steps:

1. Check if the specified port is already in use (using wait-on)
2. If the port is in use, check which processes are using it:
   - If a process in the current working directory is using the port, the command will do nothing (to avoid duplicate services)
   - If processes in different directories are using the port, the command will attempt to kill them
   - If the port cannot be freed after killing the processes, the command will fail with an error
3. Run the command as a background process
4. Wait for the service to become available on the specified port (with a timeout)
5. If a resource was specified, also wait for that resource to be accessible
6. Exit with status code 0 if the service is successfully running, or status code 1 if any errors occur

Example:

```bash
# Start the development server that runs on port 3000
launch-service start 'pnpm serve' 3000

# Start the server and verify that the health endpoint is accessible
launch-service start 'pnpm serve' 3000 --resource http://localhost:3000/api/health
```

### Stop a service

```bash
launch-service stop <port>
```

Arguments:

- `<port>` - Required: Port of the service to stop

The stop command:

1. Checks if any service is running on the specified port
2. If no service is found, it reports that there's nothing to stop
3. If a service is found, it attempts to kill all processes using that port
4. Waits for the port to be freed (using wait-on with reverse mode)
5. Reports success or failure

Example:

```bash
# Stop the service running on port 3000
launch-service stop 3000
```

## Resource Checking

The `--resource` option allows you to specify an additional resource to monitor beyond just the port. This is useful for ensuring that your service is fully available and responding properly before proceeding.

Some examples of resources you can check:

- HTTP endpoints: `http://localhost:3000/api/health`
- HTTPS endpoints: `https://localhost:3000/status`
- Files: `file:/path/to/file`
- TCP ports: `tcp:localhost:5432`

The service will be considered ready only when both the port is bound AND the specified resource is available.

## Dependencies

This tool uses the following key dependencies:

- `wait-on`: For checking port availability and monitoring when services start or stop
- `find-process`: For identifying processes using a specific port
- `commander`: For command-line argument parsing
