const { FuseBox, CSSPlugin, SassPlugin, WebIndexPlugin, QuantumPlugin, Sparky } = require("fuse-box");

let fuse, client, server, vendor, isProduction = false;

Sparky.task("config", () => {
    fuse = FuseBox.init({
        homeDir: "src",
        output: "dist/$name.js",
        experimentalFeatures: true,
        hash: false,
        sourceMaps: !isProduction,        
        plugins: [
            WebIndexPlugin(),
            isProduction && QuantumPlugin({
                uglify: false,
                bakeApiIntoBundle: "server/server",
                target: "server",
                // containedAPI: f
            }),
        ]
    });

    // vendor should come first
    // vendor = fuse.bundle("client/vendor")
    //     .instructions("~ index.ts + moment");

    // out main bundle
    // client = fuse.bundle("client/client")
    //     .split("routes/home/**", "home > routes/home/HomeComponent.ts")
    //     .split("routes/about/**", "about > routes/about/AboutComponent.ts")
    //     .instructions("> [client/index.ts] [**/**.ts]")

    server = fuse.bundle("server/server")
        // .plugin(isProduction && QuantumPlugin({
        //     uglify: false
        // }))
        // .target("server")
        .splitConfig({ browser: "../thisisbrowser/", server: "../",  dest: "bundles/" })        
        .split("routes/home/**", "home > routes/home/HomeComponent.ts")
        .split("routes/about/**", "about > routes/about/AboutComponent.ts")
        .instructions("> [server/index.ts] [routes/**/**.ts]")

    if (!isProduction) {
        fuse.dev();
    }
});

// development task "node fuse""
Sparky.task("default", ["config"], () => {
    // vendor.hmr().watch();
    // client.watch();
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
    return client.test();
});