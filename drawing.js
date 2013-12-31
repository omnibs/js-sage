var TextBox = function (screen, context) {
    this.visible = false;
    this.screen = screen;
    this.marginPercentX = 0;
    this.marginPercentY = 0.8;
    this.textMarginX = 0.1;
    this.textMarginY = 0.2;
    this.backgroundColor = 'rgba(0,0,0,1)';
    this.textColor = 'white';
    this.font = '16pt Calibri';
    this.putText = function (text) {
        context.font = '16pt Calibri';
        context.fillStyle = 'white';
        var startOfTextBox = this.screen.height * this.marginPercentY;
        var textBoxHeight = this.screen.height * (1 - this.marginPercentY);
        var startOfText = startOfTextBox + (textBoxHeight * this.textMarginY);
        var textWidth = this.screen.width * (1 - 2 * this.textMarginX);
        wrapText(context, text, this.screen.width * this.textMarginX, startOfText, textWidth, 20/*lineHeight*/);
    };
    this.askOptions = function (text, options) {
        for (var i = 0; i < options.length; i++) {
            options[i] = (i + 1) + ') ' + options[i] + ';';
        }
        this.putText(text + "\n\n" + options.join('\n'));
    };
    this.show = function () {
        this.visible = !this.visible;
        context.beginPath();
        context.rect(this.marginPercentX, this.screen.height * (this.marginPercentY), this.screen.width, this.screen.height * (1 - this.marginPercentY));
        context.fillStyle = this.backgroundColor;
        context.fill();
        context.lineWidth = 0;
        context.stroke();
    };

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            // support line breaks
            if (words[n].indexOf('\n') >= 0) {
                var splitted = words[n].split('\n');
                // write all but the last part
                for (var i = 0; i < splitted.length - 1; i++) {
                    line += splitted[i];
                    context.fillText(line, x, y);
                    line = '';
                    y += lineHeight;
                }

                // keep only the last part
                words[n] = splitted[splitted.length - 1];
            }

            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }
};
var Screen = function (canvas, context) {
    var self = this;
    this.width = canvas.width || 800;
    this.height = canvas.height || 600;
    this.textBox = new TextBox(this, context);
    this.backgroundImage = null;
    this.layers = [];
    this.readKeyCallBack = null;
    //this.putImage = function (src, x, y, scalex, scaley) {
    this.putImage = function (arg, callback) {
        var img = new Image();
        img.src = typeof arg == "string" ? arg : arg.image;
        img.onload = function () {
            context.drawImage(img, arg.x || 0, arg.y || 0, img.width * (arg.scalex || 1), img.height * (arg.scaley || 1));
            callback();
        };
    };
    this.readKey = function (specificKey, callback) {
        this.readKeyCallBack = callback;
    };
    this.putText = function(text, callback){
        this.textBox.show();
        this.textBox.putText(text);
        callback();
    };
    this.askOptions = function (text, options, callback) {
        this.textBox.show();
        this.textBox.askOptions(text, options);
        self.readKeyCallBack = callback;
    }
    this.clear = function (whatever, callback) {
        // Store the current transformation matrix
        context.save();

        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Restore the transform
        context.restore();

        callback();
    }

    canvas.addEventListener("keypress", function (evt) {
        var charCode = evt.which;
        var charStr = String.fromCharCode(charCode);
        if (self.readKeyCallBack) {
            var callback = self.readKeyCallBack;
            if (self.readKeyCallBack((charStr - 0) - 1) == false) {
                // if its not accepted, keep the callback
                self.readKeyCallBack = callback;
            }
        }
            
    });
};