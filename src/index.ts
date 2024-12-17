import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import os from "os";

let currentCameraState = "Unknown";

interface Config {
  device?: string;
  onChange: (data: string) => void;
  onError: (error: Error) => void;
}

function watch(config: Config): void {
  const hostOS = os.platform();

  switch (hostOS) {
    case "darwin":
      watchCameraLogsMac(config);
      break;
    case "linux":
      watchCameraLogsLinux(config);
      break;
  }
}

function watchCameraLogsMac(config: Config): void {
  const logs = spawnCameraStreamProcessMac();
  wacthStdout(logs, {
    onChange: (data) => {
      const cameraState = getCameraStateFromLogMac(data);
      currentCameraState = cameraState;
      config.onChange(cameraState);
    },
    onError: config.onError,
  });
}

function watchCameraLogsLinux(config: Config): void {
  const deviceName = config.device || "video0";
  const logs = spawnCameraStreamProcessLinux(deviceName);

  wacthStdout(logs, {
    onChange: (data) => {
      const cameraState = getCameraStateFromLogLinux(data, deviceName);

      if (cameraState !== currentCameraState) {
        currentCameraState = cameraState;
        config.onChange(cameraState);
      }
    },
    onError: config.onError,
  });
}

function wacthStdout(process: ChildProcessWithoutNullStreams, config: Config): void {
  process.stdout.setEncoding("utf8");
  process.stdout.on("data", (data: string) => {
    if (config.onChange) {
      config.onChange(data);
    }
  });

  process.stderr.setEncoding("utf8");
  process.stderr.on("data", (error: Error) => {
    if (config.onError) {
      config.onError(error);
    }
  });

  process.on("exit", (code: any) => {
    console.error("child process exited with code " + code.toString());
  });
}

function getCameraStateFromLogMac(log: string): string {
  return log.indexOf("Connect") !== -1 ? "On" : "Off";
}

function getCameraStateFromLogLinux(log: string, deviceName: string): string {
  return log.indexOf(deviceName) === -1 ? "Off" : "On";
}

function spawnCameraStreamProcessMac(): ChildProcessWithoutNullStreams {
  return spawn("log", [
    "stream",
    "--predicate",
    `subsystem contains "com.apple.UVCExtension" and composedMessage contains "client"`,
  ]);
}

function spawnCameraStreamProcessLinux(deviceName: string): ChildProcessWithoutNullStreams {
  return spawn("lsof", ["-r", "1", `/dev/${deviceName}`]);
}

export { watch };
