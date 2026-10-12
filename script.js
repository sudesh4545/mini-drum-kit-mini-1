(function () {
        "use strict";
        var sounds = [
            ["Kick", "a", 70],
            ["Snare", "s", 180],
            ["Hi-hat", "d", 320],
            ["Clap", "f", 220],
            ["Tom", "g", 130],
            ["Rim", "h", 480],
            ["Open hat", "j", 410],
            ["Low tom", "k", 95],
            ["Perc", "l", 560],
          ],
          ctx,
          master,
          pattern = Array(16).fill(false),
          playing = false,
          tick = 0,
          timer,
          $ = function (x) {
            return document.getElementById(x);
          };
        function hit(i) {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          master = master || ctx.createGain();
          if (!master.__ready) {
            master.gain.value = 0.45;
            master.connect(ctx.destination);
            master.__ready = true;
          }
          var o = ctx.createOscillator(),
            g = ctx.createGain(),
            n = ctx.createBufferSource(),
            buf = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate),
            d = buf.getChannelData(0);
          for (var x = 0; x < d.length; x++)
            d[x] = (Math.random() * 2 - 1) * (1 - x / d.length);
          n.buffer = buf;
          o.frequency.setValueAtTime(sounds[i][2], ctx.currentTime);
          o.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);
          g.gain.setValueAtTime(i === 0 ? 0.9 : 0.42, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
          (i === 0 || i === 4 || i === 7 ? o : n).connect(g).connect(master);
          if (i === 0 || i === 4 || i === 7) o.start();
          else n.start();
          setTimeout(function () {
            o.stop && o.stop();
          }, 200);
          var p = document.querySelector('[data-pad="' + i + '"]');
          p.classList.add("active");
          setTimeout(function () {
            p.classList.remove("active");
          }, 100);
        }
        sounds.forEach(function (s, i) {
          var b = document.createElement("button");
          b.className = "pad";
          b.dataset.pad = i;
          b.innerHTML =
            "<b>" + s[0] + "</b><small>" + s[1].toUpperCase() + " key</small>";
          b.onclick = function () {
            hit(i);
          };
          $("pads").appendChild(b);
        });
        pattern.forEach(function (_, i) {
          var b = document.createElement("button");
          b.className = "step";
          b.textContent = i + 1;
          b.onclick = function () {
            pattern[i] = !pattern[i];
            b.classList.toggle("on", pattern[i]);
          };
          $("steps").appendChild(b);
        });
        function pulse() {
          document.querySelectorAll(".step").forEach(function (x, i) {
            x.classList.toggle("playing", i === tick);
          });
          if (pattern[tick]) hit(tick % 9);
          tick = (tick + 1) % 16;
        }
        function schedule() {
          clearInterval(timer);
          if (playing) {
            pulse();
            timer = setInterval(pulse, 60000 / +$("tempo").value / 4);
          }
        }
        $("play").onclick = function () {
          playing = !playing;
          $("play").textContent = playing ? "■ Stop" : "▶ Play";
          schedule();
        };
        $("clear").onclick = function () {
          pattern.fill(false);
          document.querySelectorAll(".step").forEach(function (x) {
            x.classList.remove("on");
          });
        };
        $("tempo").oninput = function () {
          $("tempoText").textContent = $("tempo").value + " BPM";
          schedule();
        };
        document.onkeydown = function (e) {
          if (e.repeat || /input/i.test(e.target.tagName)) return;
          var i = sounds.findIndex(function (s) {
            return s[1] === e.key.toLowerCase();
          });
          if (i >= 0) hit(i);
        };
      })();
