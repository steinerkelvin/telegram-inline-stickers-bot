{
  description = "telegram-inline-stickers-bot";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = [
            pkgs.dbmate
            pkgs.postgresql_15
            pkgs.sqlfluff
            pkgs.docker-compose
            # (pkgs.callPackage ./default.nix { })
          ];
        };
      }
    );
}
