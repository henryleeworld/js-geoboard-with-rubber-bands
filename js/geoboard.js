const frame = new Frame("fit", 1024, 768, blue, dark);
frame.on("ready", () => { // ES6 Arrow Function - similar to function(){}
    zog("ready from ZIM Frame"); // logs in console (F12 - choose console)

    const stage = frame.stage;
    const stageW = frame.width;
    const stageH = frame.height;

    new Rectangle(600, 550, black, black, 4, 70).alp(.1).center();

    class Nail extends Container {
        constructor(radius = 20) {
            // this calls the Container and sets its origin and registration in the middle
            // like most circular items
            super(-radius, -radius, radius * 2, radius * 2);
            new Circle(radius, dark).addTo(this);
            // make the half highlight on the top
            new Circle({
                radius,
                color: silver,
                percent: 50
            }).addTo(this).rot(-45);
            new Circle(radius * .85, tin).centerReg(this);
            new Rectangle(radius * 2 * .85, 3, dark).centerReg(this);
        }
    }

    // tile nails
    const radius = 16;
    const num = 9;
    const space = 20;
    const tile = new Tile(new Nail(radius), num, num, space, space).center();

    // loop through each nail and give it some adjustments
    tile.loop(nail => {
        nail.mouseChildren = false; // so target in mousedown is on nail not part of nail
        nail.getChildAt(3).rot(rand(-60, 60)); // randomize the turn but leave highlight at top left
        if (!mobile()) nail.cache().hov(.7).sha(); // cache will unify the hover alpha
    });

    // create a band each time we mousedown and move
    let band = null;
    let nail = null;
    let bandEvent = null;
    let f = 1.02; // the scale factor on the band radius compared to nail
    let startPoint = null;
    tile.on("mousedown", e => {
        nail = e.target;
        startPoint = tile.localToGlobal(nail.x, nail.y); // get global location of nail
        // create a shape to draw band in
        band = new Shape().loc(startPoint).bot().ord(1).ble("difference"); // just above backing rectangle
        // bandEvent = nail.on("pressmove", drawBand);
        bandEvent = stage.on("stagemousemove", drawBand);
    });
    // use mouseX and mouseY as moving but then snapped x and snapped y on pressup
    function drawBand(e, x, y) {
        if (x == null) x = frame.mouseX;
        if (y == null) y = frame.mouseY;
        // get the length of the band to the x and y
        // draw it horizontal and then rotate it to the x and y
        let length = dist(startPoint.x, startPoint.y, x, y);
        band.c().s(white).ss(5).
        a(0, 0, radius * f, 90 * RAD, -90 * RAD) // arc is in radians
            .lt(length, -radius * f) // top band line is -radius in y
            .a(length, 0, radius * f, -90 * RAD, 90 * RAD).
        lt(0, radius * f) // bottom band line is +radius in y 
            .rot(angle(startPoint.x, startPoint.y, x, y));
        stage.update();
    }
    tile.on("pressup", e => {
        // nail.off("pressmove", bandEvent); // remove the pressmove event
        stage.off("stagemousemove", bandEvent); // remove the pressmove event
        // use hitTestGrid to get the index of the tile that the mouse is nearest
        // width, height, cols, rows, x, y, offsetX, offsetY, spacingX, spacingY, local, type
        let index = tile.hitTestGrid(tile.width, tile.height, num, num, frame.mouseX, frame.mouseY);
        if (index != null) { // do not use if (index) {} because index could be 0
            // the drawBand is expecting a global position 
            // so convert the location of the nearest nail to global
            let point = tile.getChildAt(index).localToGlobal(0, 0);
            drawBand(null, point.x, point.y);
        } else {
            band.removeFrom();
        }
        stage.update();
    });

    stage.update(); // this is needed to show any changes	

    // FOOTER
    // call remote script to make ZIM icon - you will not need this
    createIcon();
    createGreet();

}); // end of ready