const { FuseBox, CSSPlugin, SassPlugin, WebIndexPlugin, QuantumPlugin, Sparky } = require("fuse-box");

let fuse, app, server, vendor, isProduction = false;

Sparky.task("config", () => {
    fuse = FuseBox.init({
        homeDir: "src",
        output: "dist/$name.js",
        experimentalFeatures: true,
        hash: isProduction,
        sourceMaps: !isProduction,
        plugins: [
            WebIndexPlugin(),
            isProduction && QuantumPlugin({
                uglify: false
            }),
        ]
    });

    // vendor should come first
    vendor = fuse.bundle("client/vendor")
        .instructions("~ index.ts + moment");

    // out main bundle
    app = fuse.bundle("client/app")
        .split("routes/home/**", "home > routes/home/HomeComponent.ts")
        .split("routes/about/**", "about > routes/about/AboutComponent.ts")
        .instructions("> [client/index.ts] [**/**.ts]")

    app = fuse.bundle("server/app")
        .split("routes/home/**", "home > routes/home/HomeComponent.ts")
        .split("routes/about/**", "about > routes/about/AboutComponent.ts")
        .instructions("> [server/index.ts] [**/**.ts]")

    if (!isProduction) {
        fuse.dev();
    }
});

// development task "node fuse""
Sparky.task("default", ["config"], () => {
    vendor.hmr().watch();
    app.watch();
    return fuse.run();
});

// Dist task "node fuse dist"
Sparky.task("dist", ["set-production", "config"], () => {
    fuse.dev();
    return fuse.run();
});

Sparky.task("set-production", () => {
    isProduction = true;
    return Sparky.src("dist/").clean("dist/");
});

Sparky.task("test", ["config"], () => {
    return app.test();
});