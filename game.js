// JavaScript source code
var Game = function (screen) {
    this.scenes = [];

    this.play = function () {
        for (var k in this.scenes) {
            var scene = this.scenes[k];
            scene.game = this;
        }

        var scene = this.scenes[0];
        scene.play(screen);
    };

    this.changeScene = function (i) {
        this.scenes[i].play(screen);
    }
}

var Scene = function () {
    var self = this;

    this.queue = [];

    this.play = function (screen) {
        for (var i = 0; i < this.queue.length; i++) {
            var item = this.queue[i];
            var next = i < this.queue.length - 1 ? this.queue[i + 1] : null;
            if (next)
                item.next = next;
        }

        this.act(this.queue[0], screen);
    };

    this.act = function (item, screen) {
        if (item.command == 'wait') {
            setTimeout(function () { self.act(item.next, screen); }, item.command.argument - 0);
            return;
        }

        if (item.command == 'jump') {
            this.game.changeScene(item.argument);
            return;
        }

        if (item.command == 'askOptions') {
            // get only text parts from options
            var options = [];
            for (var i = 0; i < item.argument.options.length; i++) {
                options.push(item.argument.options[i].text);
            }

            screen.askOptions(item.argument.text, options, function (opt) {
                var idx = opt - 0;
                if (idx >= 0 && item.argument.options.length > idx) {
                    self.game.changeScene(item.argument.options[opt - 0].skipTo);
                    return true;
                }

                return false;
            });
            return;
        }

        if (screen[item.command]) {
            screen[item.command](item.argument, function () { self.act(item.next, screen); });
            return;
        }
        else {
            throw 'Command not found: ' + item.command;
        }
    };
}