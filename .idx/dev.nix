{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20,
    pkgs.bun
  ];
  idx.extensions = [
    "svelte.svelte-vscode",
    "vue.volar"
  ];
  idx.previews = {
    web = {
      command = [
        "bun",
        "run",
        "dev",
        "--",
        "--port",
        "$PORT",
        "--host",
        "0.0.0.0"
      ];
      manager = "web";
    };
  };
}