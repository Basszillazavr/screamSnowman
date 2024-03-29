var canvas, stage;
var w = 1280;
var h = 720;
var flakes = [];
var slow = 0.5;
var normal = 1;
var fast = 3;
var left = 2;
var none = 0;
var right = -2;
var container;
var hats = [];
var trees = [];
var titleImage;
var messages = [
  {label:"message2", width:472 , height:24},
  {label:"message3", width:407 , height:24},
  {label:"message4", width:448, height:24}
]

function loadAssets() {
        manifest = [
                {src: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1524180/scream_copy.mp3", id: "scream"},
                {src: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1524180/jiggle.mp3", id: "jiggle"},
                {src: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1524180/musicJiggle.mp3", id: "music"}
            ];

          loader = new createjs.LoadQueue(true);
          loader.installPlugin(createjs.Sound);
          loader.addEventListener("complete", handleComplete);
          loader.loadManifest(manifest);
}

function loadTitle() {
  titleImage = new Image();
  titleImage.onload = handleImageLoad;
  titleImage.src = "test.svg";
}

function handleImageLoad() {
  addTitle();
}

function init() {
  loadTitle();
    comp = AdobeAn.getComposition("8E18996963D047A1ACCEA5C0E8EE2377");
        lib = comp.getLibrary();
        canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        scale = Math.min(canvas.width, canvas.height)/720;

        border = new createjs.Shape();
        border.graphics.ss(1).s("#FF0000").mt(canvas.width>>1, 0).lt(canvas.width>>1, canvas.height)

        container = new createjs.Container();
        container.width = canvas.width;
        container.height = canvas.height;

        container.regX = container.width>>1;
        container.regY = container.height>>1;

        container.x = container.width>>1;
        container.y = container.height>>1;

        stage = new createjs.Stage(canvas);
   createjs.Touch.enable(stage);

        createjs.Ticker.framerate = lib.properties.fps;
        createjs.Ticker.addEventListener("tick", tick);

        snowField = createSnowFlakes(150, none, slow, 0.5, 0.5);
        snowField1 = createSnowFlakes(75, none, fast, 0.5, 0.9);

        addGround();
        addTrees();

        

        stage.addChild(snowField);
        stage.addChild(container);
        snowmanContainer = stage.addChild(new createjs.Container());
        stage.addChild(snowField1);

        var l = 5;
        var padding = 200*Math.min(scale, 1) | 0;

        var backRow = ground.y-(10*Math.min(scale, 1));
        var frontRow = ground.y-(50*Math.min(scale, 1));
        var center = canvas.width >> 1;
        var areas = [
            {x:center - padding, y:frontRow},
            {x:center, y:frontRow},
            {x:center + padding, y:frontRow},
            {x:center - padding/2, y:backRow},
            {x:center + padding/2, y:backRow}
        ];
        var count = 0;
        for(var i=0;i<l;i++) {
            var snowman = addSnowman();
            snowman.x = areas[i].x;
            snowman.y = -4000;
            snowman.posY = areas[i].y;
            snowman.bodyY = snowman.body.y;
            snowman.hatY = snowman.hat.y;
            snowman.framerate = 35 + Math.random()*5 | 0;
      snowman.normalLeftLeg.gotoAndStop(0);
      snowman.normalRightLeg.gotoAndStop(0);
            createjs.Tween.get(snowman).wait(1000).call(function () {
                
        this.normalLeftLeg.sock.gotoAndStop(this.sockType);
                this.normalRightLeg.sock.gotoAndStop(this.sockType)
            })
    
            createjs.Tween.get(snowman).wait(1000).call(function () {
                this.face.gotoAndPlay("dance");
        this.mouth.gotoAndStop(0);
        this.face.eyes.gotoAndStop(0);
            })
            createjs.Tween.get(snowman).wait(2000).call(function () {
                this.face.gotoAndPlay("danceFast");
            })
            createjs.Tween.get(snowman).wait(i*0.04*8000).to({y:snowman.posY}, 1000).wait(i*0.04*5000).call(function (event) {
                 this.rightArm.gotoAndPlay("dance");
        this.leftArm.gotoAndPlay("dance");
            });
            snowman.scaleX = snowman.scaleY = Math.min(scale, 1);
            snowman.on("click", handleClick, this);
            snowmanContainer.addChild(snowman);
        }

        logo = new lib.LogoMC();
        logo.x = logo.y = 50;

        loadAssets();

        window.addEventListener('resize', handleResize);
    }

    function handleComplete(event) {
        scream = createjs.Sound.createInstance("scream");
        jiggle = createjs.Sound.createInstance("jiggle");
        music = createjs.Sound.createInstance("music");

        jiggle.play();
        jiggle.loop = -1;
        music.volume = 0;
        //music.loop = -1;
        music.play();
        music.on("complete",showCloseMessage);

        setMusicVolume(jiggle, 0, 5000);
        setMusicVolume(music,.5, 5000);
    }

    function updateSnow() {
        var l = flakes.length;
        for(var i=0;i<l;i++) {
            var flake = flakes[i];
            flake.rad += (flake.k / 180) * Math.PI;
            flake.x -= Math.cos(flake.rad)+flake.wind;
            flake.y += flake.speed;
            if (flake.y >= canvas.height) {
                flake.y = -15;
            }
            if (flake.x >= canvas.width) {
                flake.x = 1
            }
            if (flake.x <= 0){
                flake.x = canvas.width - 1;
            }
        }
    }

    function createSnowFlakes(total, wind, speed, min, max) {
        var container = new createjs.Container();
        for(var i=0;i<total;i++) {
            var flake = getSprite(4, 4, "#FFFFFF");
            flake.r = 1+Math.random()*speed;
            flake.k = -Math.PI+Math.random()*Math.PI;
            flake.rad = 0;
            flake.speed = speed;
            flake.wind = wind;
            flake.scaleX = flake.scaleY = min + Math.random()*max//.5+Math.random()*.5;
            flake.alpha = .5+Math.random()*1;
            flake.x = Math.random()*canvas.width;
            flake.y = Math.random()*canvas.height;
            container.addChild(flake);
            flakes.push(flake);
        }
        return container;
    }

    function getSprite(w, h, color) {
        var s = new createjs.Shape();
        s.width = w;
        s.height = h;
        s.graphics.f(color).dc(0, 0, w);
        s.cache(-w, -h, w*2, h*2);
        return new createjs.Bitmap(s.cacheCanvas);
    }

    

    function handleClick(event) {
        var currentTarget = event.currentTarget;
        if (currentTarget == null) { return; }
        event.remove();
        createCandyCane(currentTarget);
    }

    function addSnowman() {
        var rand = Math.random() * 3 | 0;
        var snowman = null;
        var bodytype = 0;
        var bodyLabel = 0;
        switch(rand) {
            case 0:
                snowman = new lib.NormalSnowmanMC();
                bodytype = 0;
                bodyLabel = "normal";
                break;
            case 1:
                snowman = new lib.SkinnySnowmanMC();
                bodytype = 1;
                bodyLabel = "skinny";
                break;
            case 2:
                snowman = new lib.FattySnowmanMC();
                bodytype = 2;
                bodyLabel = "fatty";
                break;
            default:
                snowman = new lib.NormalSnowmanMC();
                bodytype = 0;
                bodyLabel = "normal";
        }

        var hat = snowman.hat;
        var scarf = snowman.scarf;
        var leftArm = snowman.leftArm;
        var rightArm = snowman.rightArm;
        var rightLeg = snowman.normalRightLeg.sock;
        var leftLeg = snowman.normalLeftLeg.sock;
        snowman.gotoAndStop(0);

        leftArm.stop();
        rightArm.stop();

        var ran = Math.random()*hat.totalFrames | 0;
        hatType = ran;

        hat.gotoAndStop(ran);
        ran = Math.random()*scarf.totalFrames | 0;
        scarf.gotoAndStop(ran);

        scarfType = ran;
        switch (scarfType) {
            case 0:
                sockType = "redFeetIdle";
                break;
            case 1:
                sockType = "yellowFeetIdle";
                break;
            case 2:
                sockType = "greenFeetIdle";
                break;
            default:
                sockType = "redFeetIdle";
        }
        snowman.bodyType = bodytype;
        snowman.hatType = hatType;
        snowman.scarfType = scarfType;
        snowman.bodyLabel = bodyLabel;
        snowman.sockType = sockType;
        return snowman;
    }

    function updateClip(clip, type, hatType, scarfType, dropHat, sockType) {
        var l = clip.numChildren;
        for(var i=0;i<l;i++) {
            var item = clip.getChildAt(i);
            if (item.name == type) {
                item.visible = true;
            }else {
                item.visible = false;
            }
        }

        var hat = clip[type].hat;
        var scarf = clip[type].scarf;
        var leftArm = clip[type].leftArm;
        var rightArm = clip[type].rightArm;
        var mouth = clip[type].mouth;
        var eyes = clip[type].face.eyes;
        var leftSock = clip[type].normalLeftLeg.sock;
        var rightLeg = clip[type].normalRightLeg.sock;
        hat.visible = false;
        createjs.Tween.get(this).wait(700).call(function () {
            hat.gotoAndStop(hatType);

            scarf.gotoAndStop(scarfType);
            rightArm.gotoAndPlay("exit");
            leftArm.gotoAndPlay("exit");
            leftSock.gotoAndStop(sockType);
            rightLeg.gotoAndStop(sockType);
            mouth.gotoAndStop("draggedMouth");

            eyes.gotoAndStop(1);
            if (dropHat !== null) {
                dropHat.visible = true;
                createjs.Tween.get(dropHat).wait(300).to({x:dropHat.x + -Math.random()*10 | 0}, 500, createjs.Ease.backIn);
                createjs.Tween.get(dropHat).wait(300).to({y:canvas.height-Math.random()*100}, 500, createjs.Ease.getBackIn(2.5));
            }


        })
    }

    function createCandyCane(target) {

        var candy = new lib.CandycaneMC();
        var clip = candy.clip;
        var label = target.bodyLabel;
        var hat, scarf;
        clip.gotoAndStop(0);

        var dot = new createjs.Shape();
        var pt = target.hat.localToGlobal(0, 0);
        var dropHat = null;
        if (target.hat.currentLabel == "hat") {
            pt = target.hat.localToGlobal(-9, 5);
            dropHat = new lib.FrostyHat();
        }else if (target.hat.currentLabel == "santahat") {
            target.hat.localToGlobal(0, -.30);
            dropHat = new lib.SantaHat()
        }
        if (dropHat != null) {
            dropHat.x = pt.x;
            dropHat.y = pt.y;
            dropHat.visible = false;
            dropHat.scaleX = dropHat.scaleY = Math.min(scale, 1);
            hats.push(dropHat);
            stage.addChild(dropHat);
        }

        clip.visible = false;

        target.body.y = target.bodyY;
        target.hat.y = target.hatY;

        updateClip(clip, label, target.hatType, target.scarfType, dropHat, target.sockType);


        candy.x = canvas.width;
        candy.y = target.y;
        candy.scaleX = candy.scaleY = Math.min(scale, 1);
        var index = snowmanContainer.getChildIndex(target);
        snowmanContainer.addChildAt(candy,(index == 0) ? 0 : index-1);

        candyCaneGo(target, candy);
    }

    function candyCaneGo(target, clip) {
        var offset = 339*Math.min(scale, 1);;

        createjs.Tween.get(clip).to({x:target.x-offset}, 1000,  createjs.Ease.getBackOut(1.5)).call(function() {
            clip.play();
            target.visible = false;
            clip.clip.visible = true;
            scream.volume = .7;
            scream.play();


        }).to({x:canvas.width}, 1000, createjs.Ease.circIn).call(function () {
            snowmanContainer.removeChild(clip);
            snowmanContainer.removeChild(target);
            setMusicVolume(scream, 0, 800);
            if (snowmanContainer.numChildren == 0) {
                showCloseMessage();
            }
        })
    }

    function showCloseMessage() {
        setMusicVolume(music, 0, 1000);
        setMusicVolume(jiggle,.5, 1000);

        if (snowmanContainer.numChildren > 0) {
            createjs.Tween.get(snowmanContainer).to({alpha:0}, 1000)
        }

        var messageTxt = messages[Math.random()*messages.length | 0];
        createjs.Tween.get(message).to({alpha:0}, 1000).call(function () {
            this.gotoAndStop(messageTxt.label);
            updateMessage();
        })

        createjs.Tween.get(title, {override:true}).wait(1000).call(function () {
            createjs.Tween.get(message).to({alpha:1}, 1000);

        })
    }

    function setMusicVolume(music, volume, time) {
      createjs.Tween.get(music, {override:true}).to({volume:volume}, time).call(function() {
      });
    }

    function addTrees() {
        var treeW = 310*Math.min(scale, 1);
        var treeH = 347*Math.min(scale, 1);
        var total = 3;
        var tree = new lib.TreeMC();
        tree.cache(-310/2, -347, treeW*2, treeH*2);
        var center = canvas.width>>1;
        var areas = [
            {x:center/4},
            {x:center-treeW/2},
            {x:center + (center/2-treeW/2)}
        ]
        for(var i=0;i<areas.length;i++) {
            var treeBit = new createjs.Bitmap(tree.cacheCanvas);
            treeBit.x =areas[i].x;
            treeBit.alpha =1
            treeBit.y = ground.y - treeH//*Math.min(scale, 1);
            treeBit.scaleX = treeBit.scaleY = Math.min(scale, 1);
            trees.push(treeBit);
            container.addChild(treeBit);
        }
    }

    function addGround() {
        ground = new createjs.Shape();
        ground.width = canvas.width;
        ground.height = 216*Math.min(scale, 1);
        ground.graphics.clear().f("#81CCCF").dr(0, 0, ground.width, ground.height);
        ground.cache(0, 0, ground.width, ground.height);
        ground.y = (canvas.height - ground.height)
        container.addChild(ground);
    }

    function updateMessage() {
        title.width = 650 *Math.min(scale, 1);
        title.height = 109 *Math.min(scale, 1);

        title.scaleX = title.scaleY = Math.min(scale, 1);
        title.x = ((canvas.width/2) - (title.width/2));
        title.y = canvas.height * .10;

        if (message.currentLabel !== "message1") {
            var l = messages.length;
            for(var i=0;i<l;i++) {
                var m = messages[i];
                if (message.currentLabel == m.label) {
                    message.width = messages[i].width*Math.min(scale, 1);
                    message.x = title.x + (title.width - message.width>>1);
                    message.y = title.y + title.height;
                }

            }
        }else {
            message.width = 161*Math.min(scale, 1);
            message.x = title.x + title.width - message.width;
            message.y = title.y + title.height;
        }
        message.scaleX = message.scaleY = scale;
    }

    function handleResize(event) {
    //return;
    canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        scale = Math.min(canvas.width, canvas.height)/720;
   
        ground.width = canvas.width;
        ground.height = 216*Math.min(scale, 1);;
        ground.uncache();
        ground.graphics.clear().f("#81CCCF").dr(0, 0, ground.width, ground.height);
        ground.cache(0, 0, ground.width, ground.height);
        ground.y = (canvas.height - ground.height) //* Math.min(scale, 1);;
     
        var padding = 200*Math.min(scale, 1);
        var backRow = ground.y-(10*Math.min(scale, 1));
        var frontRow = ground.y-(50*Math.min(scale, 1));
        var center = canvas.width >> 1;
        var areas = [
            {x:center - padding, y:frontRow},
            {x:center, y:frontRow},
            {x:center + padding, y:frontRow},
            {x:center - padding/2, y:backRow},
            {x:center + padding/2, y:backRow}
        ];
    
   
        var l = snowmanContainer.numChildren;
        for(var i=l-1;i>=0;i--) {
            var snowman = snowmanContainer.getChildAt(i);
            var area = areas[i];
            snowman.x = area.x
            snowman.y = area.y;
            snowman.scaleX = snowman.scaleY = Math.min(scale, 1);
        }
     
        var treeW = 310*Math.min(scale, 1);
        var treeH = 347*Math.min(scale, 1);
        var center = canvas.width>>1;
  
        var areas = [
            {x:center/4},
            {x:center-treeW/2},
            {x:center + (center/2-treeW/2)}
        ]
    
        for(var i=0;i<areas.length;i++) {
            var tree = trees[i];
            tree.x = areas[i].x;
            tree.y = ground.y - treeH;
            tree.scaleX = tree.scaleY = Math.min(scale, 1);
        }
    
   
        l = hats.length;
        for(var i=0;i<l;i++) {
            var hat = hats[i];
            hat.visible = false;
        }
     
        updateMessage();

        for(var i=0;i<flakes.length;i++) {
            var flake = flakes[i];
            flake.x = Math.random()*canvas.width;
            flake.y = Math.random()*canvas.height;
        }
    
    stage.update(lastEvent);
    }

var lastEvent;
    function tick(event) {
    lastEvent = event;
        updateSnow();

        stage.update(event);
    }

    init();