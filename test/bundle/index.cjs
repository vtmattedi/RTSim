var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/readline-sync/lib/readline-sync.js
var require_readline_sync = __commonJS({
  "node_modules/readline-sync/lib/readline-sync.js"(exports2) {
    "use strict";
    var IS_WIN = process.platform === "win32";
    var ALGORITHM_CIPHER = "aes-256-cbc";
    var ALGORITHM_HASH = "sha256";
    var DEFAULT_ERR_MSG = "The current environment doesn't support interactive reading from TTY.";
    var fs2 = require("fs");
    var TTY = process.binding("tty_wrap").TTY;
    var childProc = require("child_process");
    var pathUtil = require("path");
    var defaultOptions = {
      /* eslint-disable key-spacing */
      prompt: "> ",
      hideEchoBack: false,
      mask: "*",
      limit: [],
      limitMessage: "Input another, please.$<( [)limit(])>",
      defaultInput: "",
      trueValue: [],
      falseValue: [],
      caseSensitive: false,
      keepWhitespace: false,
      encoding: "utf8",
      bufferSize: 1024,
      print: void 0,
      history: true,
      cd: false,
      phContent: void 0,
      preCheck: void 0
      /* eslint-enable key-spacing */
    };
    var fdR = "none";
    var isRawMode = false;
    var salt = 0;
    var lastInput = "";
    var inputHistory = [];
    var _DBG_useExt = false;
    var _DBG_checkOptions = false;
    var _DBG_checkMethod = false;
    var fdW;
    var ttyR;
    var extHostPath;
    var extHostArgs;
    var tempdir;
    var rawInput;
    function getHostArgs(options) {
      function encodeArg(arg) {
        return arg.replace(/[^\w\u0080-\uFFFF]/g, function(chr) {
          return "#" + chr.charCodeAt(0) + ";";
        });
      }
      return extHostArgs.concat(function(conf) {
        var args = [];
        Object.keys(conf).forEach(function(optionName) {
          if (conf[optionName] === "boolean") {
            if (options[optionName]) {
              args.push("--" + optionName);
            }
          } else if (conf[optionName] === "string") {
            if (options[optionName]) {
              args.push("--" + optionName, encodeArg(options[optionName]));
            }
          }
        });
        return args;
      }({
        /* eslint-disable key-spacing */
        display: "string",
        displayOnly: "boolean",
        keyIn: "boolean",
        hideEchoBack: "boolean",
        mask: "string",
        limit: "string",
        caseSensitive: "boolean"
        /* eslint-enable key-spacing */
      }));
    }
    function _execFileSync(options, execOptions) {
      function getTempfile(name) {
        var suffix = "", filepath, fd;
        tempdir = tempdir || require("os").tmpdir();
        while (true) {
          filepath = pathUtil.join(tempdir, name + suffix);
          try {
            fd = fs2.openSync(filepath, "wx");
          } catch (e) {
            if (e.code === "EEXIST") {
              suffix++;
              continue;
            } else {
              throw e;
            }
          }
          fs2.closeSync(fd);
          break;
        }
        return filepath;
      }
      var res = {}, pathStdout = getTempfile("readline-sync.stdout"), pathStderr = getTempfile("readline-sync.stderr"), pathExit = getTempfile("readline-sync.exit"), pathDone = getTempfile("readline-sync.done"), crypto = require("crypto"), hostArgs, shellPath, shellArgs, exitCode, extMessage, shasum, decipher, password;
      shasum = crypto.createHash(ALGORITHM_HASH);
      shasum.update("" + process.pid + salt++ + Math.random());
      password = shasum.digest("hex");
      decipher = crypto.createDecipher(ALGORITHM_CIPHER, password);
      hostArgs = getHostArgs(options);
      if (IS_WIN) {
        shellPath = process.env.ComSpec || "cmd.exe";
        process.env.Q = '"';
        shellArgs = [
          "/V:ON",
          "/S",
          "/C",
          "(%Q%" + shellPath + "%Q% /V:ON /S /C %Q%%Q%" + extHostPath + "%Q%" + hostArgs.map(function(arg) {
            return " %Q%" + arg + "%Q%";
          }).join("") + " & (echo !ERRORLEVEL!)>%Q%" + pathExit + "%Q%%Q%) 2>%Q%" + pathStderr + "%Q% |%Q%" + process.execPath + "%Q% %Q%" + __dirname + "\\encrypt.js%Q% %Q%" + ALGORITHM_CIPHER + "%Q% %Q%" + password + "%Q% >%Q%" + pathStdout + "%Q% & (echo 1)>%Q%" + pathDone + "%Q%"
        ];
      } else {
        shellPath = "/bin/sh";
        shellArgs = [
          "-c",
          // Use `()`, not `{}` for `-c` (text param)
          '("' + extHostPath + '"' + /* ESLint bug? */
          // eslint-disable-line no-path-concat
          hostArgs.map(function(arg) {
            return " '" + arg.replace(/'/g, "'\\''") + "'";
          }).join("") + '; echo $?>"' + pathExit + '") 2>"' + pathStderr + '" |"' + process.execPath + '" "' + __dirname + '/encrypt.js" "' + ALGORITHM_CIPHER + '" "' + password + '" >"' + pathStdout + '"; echo 1 >"' + pathDone + '"'
        ];
      }
      if (_DBG_checkMethod) {
        _DBG_checkMethod("_execFileSync", hostArgs);
      }
      try {
        childProc.spawn(shellPath, shellArgs, execOptions);
      } catch (e) {
        res.error = new Error(e.message);
        res.error.method = "_execFileSync - spawn";
        res.error.program = shellPath;
        res.error.args = shellArgs;
      }
      while (fs2.readFileSync(pathDone, { encoding: options.encoding }).trim() !== "1") {
      }
      if ((exitCode = fs2.readFileSync(pathExit, { encoding: options.encoding }).trim()) === "0") {
        res.input = decipher.update(
          fs2.readFileSync(pathStdout, { encoding: "binary" }),
          "hex",
          options.encoding
        ) + decipher.final(options.encoding);
      } else {
        extMessage = fs2.readFileSync(pathStderr, { encoding: options.encoding }).trim();
        res.error = new Error(DEFAULT_ERR_MSG + (extMessage ? "\n" + extMessage : ""));
        res.error.method = "_execFileSync";
        res.error.program = shellPath;
        res.error.args = shellArgs;
        res.error.extMessage = extMessage;
        res.error.exitCode = +exitCode;
      }
      fs2.unlinkSync(pathStdout);
      fs2.unlinkSync(pathStderr);
      fs2.unlinkSync(pathExit);
      fs2.unlinkSync(pathDone);
      return res;
    }
    function readlineExt(options) {
      var res = {}, execOptions = { env: process.env, encoding: options.encoding }, hostArgs, extMessage;
      if (!extHostPath) {
        if (IS_WIN) {
          if (process.env.PSModulePath) {
            extHostPath = "powershell.exe";
            extHostArgs = [
              "-ExecutionPolicy",
              "Bypass",
              "-File",
              __dirname + "\\read.ps1"
            ];
          } else {
            extHostPath = "cscript.exe";
            extHostArgs = ["//nologo", __dirname + "\\read.cs.js"];
          }
        } else {
          extHostPath = "/bin/sh";
          extHostArgs = [__dirname + "/read.sh"];
        }
      }
      if (IS_WIN && !process.env.PSModulePath) {
        execOptions.stdio = [process.stdin];
      }
      if (childProc.execFileSync) {
        hostArgs = getHostArgs(options);
        if (_DBG_checkMethod) {
          _DBG_checkMethod("execFileSync", hostArgs);
        }
        try {
          res.input = childProc.execFileSync(extHostPath, hostArgs, execOptions);
        } catch (e) {
          extMessage = e.stderr ? (e.stderr + "").trim() : "";
          res.error = new Error(DEFAULT_ERR_MSG + (extMessage ? "\n" + extMessage : ""));
          res.error.method = "execFileSync";
          res.error.program = extHostPath;
          res.error.args = hostArgs;
          res.error.extMessage = extMessage;
          res.error.exitCode = e.status;
          res.error.code = e.code;
          res.error.signal = e.signal;
        }
      } else {
        res = _execFileSync(options, execOptions);
      }
      if (!res.error) {
        res.input = res.input.replace(/^\s*'|'\s*$/g, "");
        options.display = "";
      }
      return res;
    }
    function _readlineSync(options) {
      var input = "", displaySave = options.display, silent = !options.display && options.keyIn && options.hideEchoBack && !options.mask;
      function tryExt() {
        var res = readlineExt(options);
        if (res.error) {
          throw res.error;
        }
        return res.input;
      }
      if (_DBG_checkOptions) {
        _DBG_checkOptions(options);
      }
      (function() {
        var fsB, constants, verNum;
        function getFsB() {
          if (!fsB) {
            fsB = process.binding("fs");
            constants = process.binding("constants");
            constants = constants && constants.fs && typeof constants.fs.O_RDWR === "number" ? constants.fs : constants;
          }
          return fsB;
        }
        if (typeof fdR !== "string") {
          return;
        }
        fdR = null;
        if (IS_WIN) {
          verNum = function(ver) {
            var nums = ver.replace(/^\D+/, "").split(".");
            var verNum2 = 0;
            if (nums[0] = +nums[0]) {
              verNum2 += nums[0] * 1e4;
            }
            if (nums[1] = +nums[1]) {
              verNum2 += nums[1] * 100;
            }
            if (nums[2] = +nums[2]) {
              verNum2 += nums[2];
            }
            return verNum2;
          }(process.version);
          if (!(verNum >= 20302 && verNum < 40204 || verNum >= 5e4 && verNum < 50100 || verNum >= 50600 && verNum < 60200) && process.stdin.isTTY) {
            process.stdin.pause();
            fdR = process.stdin.fd;
            ttyR = process.stdin._handle;
          } else {
            try {
              fdR = getFsB().open("CONIN$", constants.O_RDWR, parseInt("0666", 8));
              ttyR = new TTY(fdR, true);
            } catch (e) {
            }
          }
          if (process.stdout.isTTY) {
            fdW = process.stdout.fd;
          } else {
            try {
              fdW = fs2.openSync("\\\\.\\CON", "w");
            } catch (e) {
            }
            if (typeof fdW !== "number") {
              try {
                fdW = getFsB().open("CONOUT$", constants.O_RDWR, parseInt("0666", 8));
              } catch (e) {
              }
            }
          }
        } else {
          if (process.stdin.isTTY) {
            process.stdin.pause();
            try {
              fdR = fs2.openSync("/dev/tty", "r");
              ttyR = process.stdin._handle;
            } catch (e) {
            }
          } else {
            try {
              fdR = fs2.openSync("/dev/tty", "r");
              ttyR = new TTY(fdR, false);
            } catch (e) {
            }
          }
          if (process.stdout.isTTY) {
            fdW = process.stdout.fd;
          } else {
            try {
              fdW = fs2.openSync("/dev/tty", "w");
            } catch (e) {
            }
          }
        }
      })();
      (function() {
        var isCooked = !options.hideEchoBack && !options.keyIn, atEol, limit, buffer, reqSize, readSize, chunk, line;
        rawInput = "";
        function setRawMode(mode) {
          if (mode === isRawMode) {
            return true;
          }
          if (ttyR.setRawMode(mode) !== 0) {
            return false;
          }
          isRawMode = mode;
          return true;
        }
        if (_DBG_useExt || !ttyR || typeof fdW !== "number" && (options.display || !isCooked)) {
          input = tryExt();
          return;
        }
        if (options.display) {
          fs2.writeSync(fdW, options.display);
          options.display = "";
        }
        if (options.displayOnly) {
          return;
        }
        if (!setRawMode(!isCooked)) {
          input = tryExt();
          return;
        }
        reqSize = options.keyIn ? 1 : options.bufferSize;
        buffer = Buffer.allocUnsafe && Buffer.alloc ? Buffer.alloc(reqSize) : new Buffer(reqSize);
        if (options.keyIn && options.limit) {
          limit = new RegExp(
            "[^" + options.limit + "]",
            "g" + (options.caseSensitive ? "" : "i")
          );
        }
        while (true) {
          readSize = 0;
          try {
            readSize = fs2.readSync(fdR, buffer, 0, reqSize);
          } catch (e) {
            if (e.code !== "EOF") {
              setRawMode(false);
              input += tryExt();
              return;
            }
          }
          if (readSize > 0) {
            chunk = buffer.toString(options.encoding, 0, readSize);
            rawInput += chunk;
          } else {
            chunk = "\n";
            rawInput += String.fromCharCode(0);
          }
          if (chunk && typeof (line = (chunk.match(/^(.*?)[\r\n]/) || [])[1]) === "string") {
            chunk = line;
            atEol = true;
          }
          if (chunk) {
            chunk = chunk.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
          }
          if (chunk && limit) {
            chunk = chunk.replace(limit, "");
          }
          if (chunk) {
            if (!isCooked) {
              if (!options.hideEchoBack) {
                fs2.writeSync(fdW, chunk);
              } else if (options.mask) {
                fs2.writeSync(fdW, new Array(chunk.length + 1).join(options.mask));
              }
            }
            input += chunk;
          }
          if (!options.keyIn && atEol || options.keyIn && input.length >= reqSize) {
            break;
          }
        }
        if (!isCooked && !silent) {
          fs2.writeSync(fdW, "\n");
        }
        setRawMode(false);
      })();
      if (options.print && !silent) {
        options.print(
          displaySave + (options.displayOnly ? "" : (options.hideEchoBack ? new Array(input.length + 1).join(options.mask) : input) + "\n"),
          options.encoding
        );
      }
      return options.displayOnly ? "" : lastInput = options.keepWhitespace || options.keyIn ? input : input.trim();
    }
    function flattenArray(array, validator) {
      var flatArray = [];
      function _flattenArray(array2) {
        if (array2 == null) {
          return;
        }
        if (Array.isArray(array2)) {
          array2.forEach(_flattenArray);
        } else if (!validator || validator(array2)) {
          flatArray.push(array2);
        }
      }
      _flattenArray(array);
      return flatArray;
    }
    function escapePattern(pattern) {
      return pattern.replace(
        /[\x00-\x7f]/g,
        // eslint-disable-line no-control-regex
        function(s) {
          return "\\x" + ("00" + s.charCodeAt().toString(16)).substr(-2);
        }
      );
    }
    function margeOptions() {
      var optionsList = Array.prototype.slice.call(arguments), optionNames, fromDefault;
      if (optionsList.length && typeof optionsList[0] === "boolean") {
        fromDefault = optionsList.shift();
        if (fromDefault) {
          optionNames = Object.keys(defaultOptions);
          optionsList.unshift(defaultOptions);
        }
      }
      return optionsList.reduce(function(options, optionsPart) {
        if (optionsPart == null) {
          return options;
        }
        if (optionsPart.hasOwnProperty("noEchoBack") && !optionsPart.hasOwnProperty("hideEchoBack")) {
          optionsPart.hideEchoBack = optionsPart.noEchoBack;
          delete optionsPart.noEchoBack;
        }
        if (optionsPart.hasOwnProperty("noTrim") && !optionsPart.hasOwnProperty("keepWhitespace")) {
          optionsPart.keepWhitespace = optionsPart.noTrim;
          delete optionsPart.noTrim;
        }
        if (!fromDefault) {
          optionNames = Object.keys(optionsPart);
        }
        optionNames.forEach(function(optionName) {
          var value;
          if (!optionsPart.hasOwnProperty(optionName)) {
            return;
          }
          value = optionsPart[optionName];
          switch (optionName) {
            //                    _readlineSync <- *    * -> defaultOptions
            // ================ string
            case "mask":
            // *    *
            case "limitMessage":
            //      *
            case "defaultInput":
            //      *
            case "encoding":
              value = value != null ? value + "" : "";
              if (value && optionName !== "limitMessage") {
                value = value.replace(/[\r\n]/g, "");
              }
              options[optionName] = value;
              break;
            // ================ number(int)
            case "bufferSize":
              if (!isNaN(value = parseInt(value, 10)) && typeof value === "number") {
                options[optionName] = value;
              }
              break;
            // ================ boolean
            case "displayOnly":
            // *
            case "keyIn":
            // *
            case "hideEchoBack":
            // *    *
            case "caseSensitive":
            // *    *
            case "keepWhitespace":
            // *    *
            case "history":
            //      *
            case "cd":
              options[optionName] = !!value;
              break;
            // ================ array
            case "limit":
            // *    *     to string for readlineExt
            case "trueValue":
            //      *
            case "falseValue":
              options[optionName] = flattenArray(value, function(value2) {
                var type = typeof value2;
                return type === "string" || type === "number" || type === "function" || value2 instanceof RegExp;
              }).map(function(value2) {
                return typeof value2 === "string" ? value2.replace(/[\r\n]/g, "") : value2;
              });
              break;
            // ================ function
            case "print":
            // *    *
            case "phContent":
            //      *
            case "preCheck":
              options[optionName] = typeof value === "function" ? value : void 0;
              break;
            // ================ other
            case "prompt":
            //      *
            case "display":
              options[optionName] = value != null ? value : "";
              break;
          }
        });
        return options;
      }, {});
    }
    function isMatched(res, comps, caseSensitive) {
      return comps.some(function(comp) {
        var type = typeof comp;
        return type === "string" ? caseSensitive ? res === comp : res.toLowerCase() === comp.toLowerCase() : type === "number" ? parseFloat(res) === comp : type === "function" ? comp(res) : comp instanceof RegExp ? comp.test(res) : false;
      });
    }
    function replaceHomePath(path, expand) {
      var homePath = pathUtil.normalize(
        IS_WIN ? (process.env.HOMEDRIVE || "") + (process.env.HOMEPATH || "") : process.env.HOME || ""
      ).replace(/[/\\]+$/, "");
      path = pathUtil.normalize(path);
      return expand ? path.replace(/^~(?=\/|\\|$)/, homePath) : path.replace(new RegExp("^" + escapePattern(homePath) + "(?=\\/|\\\\|$)", IS_WIN ? "i" : ""), "~");
    }
    function replacePlaceholder(text, generator) {
      var PTN_INNER = "(?:\\(([\\s\\S]*?)\\))?(\\w+|.-.)(?:\\(([\\s\\S]*?)\\))?", rePlaceholder = new RegExp("(\\$)?(\\$<" + PTN_INNER + ">)", "g"), rePlaceholderCompat = new RegExp("(\\$)?(\\$\\{" + PTN_INNER + "\\})", "g");
      function getPlaceholderText(s, escape, placeholder, pre, param, post) {
        var text2;
        return escape || typeof (text2 = generator(param)) !== "string" ? placeholder : text2 ? (pre || "") + text2 + (post || "") : "";
      }
      return text.replace(rePlaceholder, getPlaceholderText).replace(rePlaceholderCompat, getPlaceholderText);
    }
    function array2charlist(array, caseSensitive, collectSymbols) {
      var group = [], groupClass = -1, charCode = 0, symbols = "", values, suppressed;
      function addGroup(groups, group2) {
        if (group2.length > 3) {
          groups.push(group2[0] + "..." + group2[group2.length - 1]);
          suppressed = true;
        } else if (group2.length) {
          groups = groups.concat(group2);
        }
        return groups;
      }
      values = array.reduce(function(chars, value) {
        return chars.concat((value + "").split(""));
      }, []).reduce(function(groups, curChar) {
        var curGroupClass, curCharCode;
        if (!caseSensitive) {
          curChar = curChar.toLowerCase();
        }
        curGroupClass = /^\d$/.test(curChar) ? 1 : /^[A-Z]$/.test(curChar) ? 2 : /^[a-z]$/.test(curChar) ? 3 : 0;
        if (collectSymbols && curGroupClass === 0) {
          symbols += curChar;
        } else {
          curCharCode = curChar.charCodeAt(0);
          if (curGroupClass && curGroupClass === groupClass && curCharCode === charCode + 1) {
            group.push(curChar);
          } else {
            groups = addGroup(groups, group);
            group = [curChar];
            groupClass = curGroupClass;
          }
          charCode = curCharCode;
        }
        return groups;
      }, []);
      values = addGroup(values, group);
      if (symbols) {
        values.push(symbols);
        suppressed = true;
      }
      return { values, suppressed };
    }
    function joinChunks(chunks, suppressed) {
      return chunks.join(chunks.length > 2 ? ", " : suppressed ? " / " : "/");
    }
    function getPhContent(param, options) {
      var resCharlist = {}, text, values, arg;
      if (options.phContent) {
        text = options.phContent(param, options);
      }
      if (typeof text !== "string") {
        switch (param) {
          case "hideEchoBack":
          case "mask":
          case "defaultInput":
          case "caseSensitive":
          case "keepWhitespace":
          case "encoding":
          case "bufferSize":
          case "history":
          case "cd":
            text = !options.hasOwnProperty(param) ? "" : typeof options[param] === "boolean" ? options[param] ? "on" : "off" : options[param] + "";
            break;
          // case 'prompt':
          // case 'query':
          // case 'display':
          //   text = options.hasOwnProperty('displaySrc') ? options.displaySrc + '' : '';
          //   break;
          case "limit":
          case "trueValue":
          case "falseValue":
            values = options[options.hasOwnProperty(param + "Src") ? param + "Src" : param];
            if (options.keyIn) {
              resCharlist = array2charlist(values, options.caseSensitive);
              values = resCharlist.values;
            } else {
              values = values.filter(function(value) {
                var type = typeof value;
                return type === "string" || type === "number";
              });
            }
            text = joinChunks(values, resCharlist.suppressed);
            break;
          case "limitCount":
          case "limitCountNotZero":
            text = options[options.hasOwnProperty("limitSrc") ? "limitSrc" : "limit"].length;
            text = text || param !== "limitCountNotZero" ? text + "" : "";
            break;
          case "lastInput":
            text = lastInput;
            break;
          case "cwd":
          case "CWD":
          case "cwdHome":
            text = process.cwd();
            if (param === "CWD") {
              text = pathUtil.basename(text);
            } else if (param === "cwdHome") {
              text = replaceHomePath(text);
            }
            break;
          case "date":
          case "time":
          case "localeDate":
          case "localeTime":
            text = (/* @__PURE__ */ new Date())["to" + param.replace(/^./, function(str) {
              return str.toUpperCase();
            }) + "String"]();
            break;
          default:
            if (typeof (arg = (param.match(/^history_m(\d+)$/) || [])[1]) === "string") {
              text = inputHistory[inputHistory.length - arg] || "";
            }
        }
      }
      return text;
    }
    function getPhCharlist(param) {
      var matches = /^(.)-(.)$/.exec(param), text = "", from, to, code, step;
      if (!matches) {
        return null;
      }
      from = matches[1].charCodeAt(0);
      to = matches[2].charCodeAt(0);
      step = from < to ? 1 : -1;
      for (code = from; code !== to + step; code += step) {
        text += String.fromCharCode(code);
      }
      return text;
    }
    function parseCl(cl) {
      var reToken = new RegExp(/(\s*)(?:("|')(.*?)(?:\2|$)|(\S+))/g), taken = "", args = [], matches, part;
      cl = cl.trim();
      while (matches = reToken.exec(cl)) {
        part = matches[3] || matches[4] || "";
        if (matches[1]) {
          args.push(taken);
          taken = "";
        }
        taken += part;
      }
      if (taken) {
        args.push(taken);
      }
      return args;
    }
    function toBool(res, options) {
      return options.trueValue.length && isMatched(res, options.trueValue, options.caseSensitive) ? true : options.falseValue.length && isMatched(res, options.falseValue, options.caseSensitive) ? false : res;
    }
    function getValidLine(options) {
      var res, forceNext, limitMessage, matches, histInput, args, resCheck;
      function _getPhContent(param) {
        return getPhContent(param, options);
      }
      function addDisplay(text) {
        options.display += (/[^\r\n]$/.test(options.display) ? "\n" : "") + text;
      }
      options.limitSrc = options.limit;
      options.displaySrc = options.display;
      options.limit = "";
      options.display = replacePlaceholder(options.display + "", _getPhContent);
      while (true) {
        res = _readlineSync(options);
        forceNext = false;
        limitMessage = "";
        if (options.defaultInput && !res) {
          res = options.defaultInput;
        }
        if (options.history) {
          if (matches = /^\s*!(?:!|-1)(:p)?\s*$/.exec(res)) {
            histInput = inputHistory[0] || "";
            if (matches[1]) {
              forceNext = true;
            } else {
              res = histInput;
            }
            addDisplay(histInput + "\n");
            if (!forceNext) {
              options.displayOnly = true;
              _readlineSync(options);
              options.displayOnly = false;
            }
          } else if (res && res !== inputHistory[inputHistory.length - 1]) {
            inputHistory = [res];
          }
        }
        if (!forceNext && options.cd && res) {
          args = parseCl(res);
          switch (args[0].toLowerCase()) {
            case "cd":
              if (args[1]) {
                try {
                  process.chdir(replaceHomePath(args[1], true));
                } catch (e) {
                  addDisplay(e + "");
                }
              }
              forceNext = true;
              break;
            case "pwd":
              addDisplay(process.cwd());
              forceNext = true;
              break;
          }
        }
        if (!forceNext && options.preCheck) {
          resCheck = options.preCheck(res, options);
          res = resCheck.res;
          if (resCheck.forceNext) {
            forceNext = true;
          }
        }
        if (!forceNext) {
          if (!options.limitSrc.length || isMatched(res, options.limitSrc, options.caseSensitive)) {
            break;
          }
          if (options.limitMessage) {
            limitMessage = replacePlaceholder(options.limitMessage, _getPhContent);
          }
        }
        addDisplay((limitMessage ? limitMessage + "\n" : "") + replacePlaceholder(options.displaySrc + "", _getPhContent));
      }
      return toBool(res, options);
    }
    exports2._DBG_set_useExt = function(val) {
      _DBG_useExt = val;
    };
    exports2._DBG_set_checkOptions = function(val) {
      _DBG_checkOptions = val;
    };
    exports2._DBG_set_checkMethod = function(val) {
      _DBG_checkMethod = val;
    };
    exports2._DBG_clearHistory = function() {
      lastInput = "";
      inputHistory = [];
    };
    exports2.setDefaultOptions = function(options) {
      defaultOptions = margeOptions(true, options);
      return margeOptions(true);
    };
    exports2.question = function(query, options) {
      return getValidLine(margeOptions(margeOptions(true, options), {
        display: query
      }));
    };
    exports2.prompt = function(options) {
      var readOptions = margeOptions(true, options);
      readOptions.display = readOptions.prompt;
      return getValidLine(readOptions);
    };
    exports2.keyIn = function(query, options) {
      var readOptions = margeOptions(margeOptions(true, options), {
        display: query,
        keyIn: true,
        keepWhitespace: true
      });
      readOptions.limitSrc = readOptions.limit.filter(function(value) {
        var type = typeof value;
        return type === "string" || type === "number";
      }).map(function(text) {
        return replacePlaceholder(text + "", getPhCharlist);
      });
      readOptions.limit = escapePattern(readOptions.limitSrc.join(""));
      ["trueValue", "falseValue"].forEach(function(optionName) {
        readOptions[optionName] = readOptions[optionName].reduce(function(comps, comp) {
          var type = typeof comp;
          if (type === "string" || type === "number") {
            comps = comps.concat((comp + "").split(""));
          } else {
            comps.push(comp);
          }
          return comps;
        }, []);
      });
      readOptions.display = replacePlaceholder(
        readOptions.display + "",
        function(param) {
          return getPhContent(param, readOptions);
        }
      );
      return toBool(_readlineSync(readOptions), readOptions);
    };
    exports2.questionEMail = function(query, options) {
      if (query == null) {
        query = "Input e-mail address: ";
      }
      return exports2.question(query, margeOptions({
        // -------- default
        hideEchoBack: false,
        // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
        limit: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        limitMessage: "Input valid e-mail address, please.",
        trueValue: null,
        falseValue: null
      }, options, {
        // -------- forced
        keepWhitespace: false,
        cd: false
      }));
    };
    exports2.questionNewPassword = function(query, options) {
      var resCharlist, min, max, readOptions = margeOptions({
        // -------- default
        hideEchoBack: true,
        mask: "*",
        limitMessage: "It can include: $<charlist>\nAnd the length must be: $<length>",
        trueValue: null,
        falseValue: null,
        caseSensitive: true
      }, options, {
        // -------- forced
        history: false,
        cd: false,
        // limit (by charlist etc.),
        phContent: function(param) {
          return param === "charlist" ? resCharlist.text : param === "length" ? min + "..." + max : null;
        }
      }), charlist, confirmMessage, unmatchMessage, limit, limitMessage, res1, res2;
      options = options || {};
      charlist = replacePlaceholder(
        options.charlist ? options.charlist + "" : "$<!-~>",
        getPhCharlist
      );
      if (isNaN(min = parseInt(options.min, 10)) || typeof min !== "number") {
        min = 12;
      }
      if (isNaN(max = parseInt(options.max, 10)) || typeof max !== "number") {
        max = 24;
      }
      limit = new RegExp("^[" + escapePattern(charlist) + "]{" + min + "," + max + "}$");
      resCharlist = array2charlist([charlist], readOptions.caseSensitive, true);
      resCharlist.text = joinChunks(resCharlist.values, resCharlist.suppressed);
      confirmMessage = options.confirmMessage != null ? options.confirmMessage : "Reinput a same one to confirm it: ";
      unmatchMessage = options.unmatchMessage != null ? options.unmatchMessage : "It differs from first one. Hit only the Enter key if you want to retry from first one.";
      if (query == null) {
        query = "Input new password: ";
      }
      limitMessage = readOptions.limitMessage;
      while (!res2) {
        readOptions.limit = limit;
        readOptions.limitMessage = limitMessage;
        res1 = exports2.question(query, readOptions);
        readOptions.limit = [res1, ""];
        readOptions.limitMessage = unmatchMessage;
        res2 = exports2.question(confirmMessage, readOptions);
      }
      return res1;
    };
    function _questionNum(query, options, parser) {
      var validValue;
      function getValidValue(value) {
        validValue = parser(value);
        return !isNaN(validValue) && typeof validValue === "number";
      }
      exports2.question(query, margeOptions({
        // -------- default
        limitMessage: "Input valid number, please."
      }, options, {
        // -------- forced
        limit: getValidValue,
        cd: false
        // trueValue, falseValue, caseSensitive, keepWhitespace don't work.
      }));
      return validValue;
    }
    exports2.questionInt = function(query, options) {
      return _questionNum(query, options, function(value) {
        return parseInt(value, 10);
      });
    };
    exports2.questionFloat = function(query, options) {
      return _questionNum(query, options, parseFloat);
    };
    exports2.questionPath = function(query, options) {
      var error = "", validPath, readOptions = margeOptions({
        // -------- default
        hideEchoBack: false,
        limitMessage: "$<error(\n)>Input valid path, please.$<( Min:)min>$<( Max:)max>",
        history: true,
        cd: true
      }, options, {
        // -------- forced
        keepWhitespace: false,
        limit: function(value) {
          var exists, stat, res;
          value = replaceHomePath(value, true);
          error = "";
          function mkdirParents(dirPath) {
            dirPath.split(/\/|\\/).reduce(function(parents, dir) {
              var path = pathUtil.resolve(parents += dir + pathUtil.sep);
              if (!fs2.existsSync(path)) {
                fs2.mkdirSync(path);
              } else if (!fs2.statSync(path).isDirectory()) {
                throw new Error("Non directory already exists: " + path);
              }
              return parents;
            }, "");
          }
          try {
            exists = fs2.existsSync(value);
            validPath = exists ? fs2.realpathSync(value) : pathUtil.resolve(value);
            if (!options.hasOwnProperty("exists") && !exists || typeof options.exists === "boolean" && options.exists !== exists) {
              error = (exists ? "Already exists" : "No such file or directory") + ": " + validPath;
              return false;
            }
            if (!exists && options.create) {
              if (options.isDirectory) {
                mkdirParents(validPath);
              } else {
                mkdirParents(pathUtil.dirname(validPath));
                fs2.closeSync(fs2.openSync(validPath, "w"));
              }
              validPath = fs2.realpathSync(validPath);
            }
            if (exists && (options.min || options.max || options.isFile || options.isDirectory)) {
              stat = fs2.statSync(validPath);
              if (options.isFile && !stat.isFile()) {
                error = "Not file: " + validPath;
                return false;
              } else if (options.isDirectory && !stat.isDirectory()) {
                error = "Not directory: " + validPath;
                return false;
              } else if (options.min && stat.size < +options.min || options.max && stat.size > +options.max) {
                error = "Size " + stat.size + " is out of range: " + validPath;
                return false;
              }
            }
            if (typeof options.validate === "function" && (res = options.validate(validPath)) !== true) {
              if (typeof res === "string") {
                error = res;
              }
              return false;
            }
          } catch (e) {
            error = e + "";
            return false;
          }
          return true;
        },
        // trueValue, falseValue, caseSensitive don't work.
        phContent: function(param) {
          return param === "error" ? error : param !== "min" && param !== "max" ? null : options.hasOwnProperty(param) ? options[param] + "" : "";
        }
      });
      options = options || {};
      if (query == null) {
        query = 'Input path (you can "cd" and "pwd"): ';
      }
      exports2.question(query, readOptions);
      return validPath;
    };
    function getClHandler(commandHandler, options) {
      var clHandler = {}, hIndex = {};
      if (typeof commandHandler === "object") {
        Object.keys(commandHandler).forEach(function(cmd) {
          if (typeof commandHandler[cmd] === "function") {
            hIndex[options.caseSensitive ? cmd : cmd.toLowerCase()] = commandHandler[cmd];
          }
        });
        clHandler.preCheck = function(res) {
          var cmdKey;
          clHandler.args = parseCl(res);
          cmdKey = clHandler.args[0] || "";
          if (!options.caseSensitive) {
            cmdKey = cmdKey.toLowerCase();
          }
          clHandler.hRes = cmdKey !== "_" && hIndex.hasOwnProperty(cmdKey) ? hIndex[cmdKey].apply(res, clHandler.args.slice(1)) : hIndex.hasOwnProperty("_") ? hIndex._.apply(res, clHandler.args) : null;
          return { res, forceNext: false };
        };
        if (!hIndex.hasOwnProperty("_")) {
          clHandler.limit = function() {
            var cmdKey = clHandler.args[0] || "";
            if (!options.caseSensitive) {
              cmdKey = cmdKey.toLowerCase();
            }
            return hIndex.hasOwnProperty(cmdKey);
          };
        }
      } else {
        clHandler.preCheck = function(res) {
          clHandler.args = parseCl(res);
          clHandler.hRes = typeof commandHandler === "function" ? commandHandler.apply(res, clHandler.args) : true;
          return { res, forceNext: false };
        };
      }
      return clHandler;
    }
    exports2.promptCL = function(commandHandler, options) {
      var readOptions = margeOptions({
        // -------- default
        hideEchoBack: false,
        limitMessage: "Requested command is not available.",
        caseSensitive: false,
        history: true
      }, options), clHandler = getClHandler(commandHandler, readOptions);
      readOptions.limit = clHandler.limit;
      readOptions.preCheck = clHandler.preCheck;
      exports2.prompt(readOptions);
      return clHandler.args;
    };
    exports2.promptLoop = function(inputHandler, options) {
      var readOptions = margeOptions({
        // -------- default
        hideEchoBack: false,
        trueValue: null,
        falseValue: null,
        caseSensitive: false,
        history: true
      }, options);
      while (true) {
        if (inputHandler(exports2.prompt(readOptions))) {
          break;
        }
      }
    };
    exports2.promptCLLoop = function(commandHandler, options) {
      var readOptions = margeOptions({
        // -------- default
        hideEchoBack: false,
        limitMessage: "Requested command is not available.",
        caseSensitive: false,
        history: true
      }, options), clHandler = getClHandler(commandHandler, readOptions);
      readOptions.limit = clHandler.limit;
      readOptions.preCheck = clHandler.preCheck;
      while (true) {
        exports2.prompt(readOptions);
        if (clHandler.hRes) {
          break;
        }
      }
    };
    exports2.promptSimShell = function(options) {
      return exports2.prompt(margeOptions({
        // -------- default
        hideEchoBack: false,
        history: true
      }, options, {
        // -------- forced
        prompt: function() {
          return IS_WIN ? "$<cwd>>" : (
            // 'user@host:cwd$ '
            (process.env.USER || "") + (process.env.HOSTNAME ? "@" + process.env.HOSTNAME.replace(/\..*$/, "") : "") + ":$<cwdHome>$ "
          );
        }()
      }));
    };
    function _keyInYN(query, options, limit) {
      var res;
      if (query == null) {
        query = "Are you sure? ";
      }
      if ((!options || options.guide !== false) && (query += "")) {
        query = query.replace(/\s*:?\s*$/, "") + " [y/n]: ";
      }
      res = exports2.keyIn(query, margeOptions(options, {
        // -------- forced
        hideEchoBack: false,
        limit,
        trueValue: "y",
        falseValue: "n",
        caseSensitive: false
        // mask doesn't work.
      }));
      return typeof res === "boolean" ? res : "";
    }
    exports2.keyInYN = function(query, options) {
      return _keyInYN(query, options);
    };
    exports2.keyInYNStrict = function(query, options) {
      return _keyInYN(query, options, "yn");
    };
    exports2.keyInPause = function(query, options) {
      if (query == null) {
        query = "Continue...";
      }
      if ((!options || options.guide !== false) && (query += "")) {
        query = query.replace(/\s+$/, "") + " (Hit any key)";
      }
      exports2.keyIn(query, margeOptions({
        // -------- default
        limit: null
      }, options, {
        // -------- forced
        hideEchoBack: true,
        mask: ""
      }));
    };
    exports2.keyInSelect = function(items, query, options) {
      var readOptions = margeOptions({
        // -------- default
        hideEchoBack: false
      }, options, {
        // -------- forced
        trueValue: null,
        falseValue: null,
        caseSensitive: false,
        // limit (by items),
        phContent: function(param) {
          return param === "itemsCount" ? items.length + "" : param === "firstItem" ? (items[0] + "").trim() : param === "lastItem" ? (items[items.length - 1] + "").trim() : null;
        }
      }), keylist = "", key2i = {}, charCode = 49, display = "\n";
      if (!Array.isArray(items) || !items.length || items.length > 35) {
        throw "`items` must be Array (max length: 35).";
      }
      items.forEach(function(item, i) {
        var key = String.fromCharCode(charCode);
        keylist += key;
        key2i[key] = i;
        display += "[" + key + "] " + (item + "").trim() + "\n";
        charCode = charCode === 57 ? 97 : charCode + 1;
      });
      if (!options || options.cancel !== false) {
        keylist += "0";
        key2i["0"] = -1;
        display += "[0] " + (options && options.cancel != null && typeof options.cancel !== "boolean" ? (options.cancel + "").trim() : "CANCEL") + "\n";
      }
      readOptions.limit = keylist;
      display += "\n";
      if (query == null) {
        query = "Choose one from list: ";
      }
      if (query += "") {
        if (!options || options.guide !== false) {
          query = query.replace(/\s*:?\s*$/, "") + " [$<limit>]: ";
        }
        display += query;
      }
      return key2i[exports2.keyIn(display, readOptions).toLowerCase()];
    };
    exports2.getRawInput = function() {
      return rawInput;
    };
    function _setOption(optionName, args) {
      var options;
      if (args.length) {
        options = {};
        options[optionName] = args[0];
      }
      return exports2.setDefaultOptions(options)[optionName];
    }
    exports2.setPrint = function() {
      return _setOption("print", arguments);
    };
    exports2.setPrompt = function() {
      return _setOption("prompt", arguments);
    };
    exports2.setEncoding = function() {
      return _setOption("encoding", arguments);
    };
    exports2.setMask = function() {
      return _setOption("mask", arguments);
    };
    exports2.setBufferSize = function() {
      return _setOption("bufferSize", arguments);
    };
  }
});

// Simulator/Engine/Assets/Fonts.js
var smallFiGlet = [
  /*
      0-9: 0-9
      10-35: A-Z
      36-61: a-z
      62: space
  */
  [
    `  __  `,
    ` /  \\ `,
    `| () |`,
    ` \\__/ `
  ],
  [
    ` _ `,
    `/ |`,
    `| |`,
    `|_|`
  ],
  [
    ` ___ `,
    `|_  )`,
    ` / / `,
    `/___|`
  ],
  [
    ` ____`,
    `|__ /`,
    ` |_ \\`,
    `|___/`
  ],
  [
    ` _ _  `,
    `| | | `,
    `|_  _|`,
    `  |_| `
  ],
  [
    ` ___ `,
    `| __|`,
    `|__ \\`,
    `|___/`
  ],
  [
    `  __ `,
    ` / / `,
    `/ _ \\`,
    `\\___/`
  ],
  [
    ` ____ `,
    `|__  |`,
    `  / / `,
    ` /_/  `
  ],
  [
    ` ___ `,
    `( _ )`,
    `/ _ \\`,
    `\\___/`
  ],
  [
    ` ___ `,
    `/ _ \\`,
    `\\_, /`,
    ` /_/ `
  ],
  [
    ` _ `,
    `(_)`,
    ` _ `,
    `(_)`
  ],
  [
    ` _ `,
    `(_)`,
    ` _ `,
    `( )`,
    `|/ `
  ],
  [
    `  __`,
    ` / /`,
    `< < `,
    ` \\_\\`
  ],
  [
    ` ___ `,
    `|___|`,
    `|___|`
  ],
  [
    `__  `,
    `\\ \\ `,
    ` > >`,
    `/_/ `
  ],
  [
    ` ___ `,
    `|__ \\`,
    `  /_/`,
    ` (_) `
  ],
  [
    `  ____  `,
    ` / __ \\ `,
    `/ / _\` |`,
    `\\ \\__,_|`,
    ` \\____/ `
  ],
  [
    `   _   `,
    `  /_\\  `,
    ` / _ \\ `,
    `/_/ \\_\\`
  ],
  [
    ` ___ `,
    `| _ )`,
    `| _ \\`,
    `|___/`
  ],
  [
    `  ___ `,
    ` / __|`,
    `| (__ `,
    ` \\___|`
  ],
  [
    ` ___  `,
    `|   \\ `,
    `| |) |`,
    `|___/ `
  ],
  [
    ` ___ `,
    `| __|`,
    `| _| `,
    `|___|`
  ],
  [
    ` ___ `,
    `| __|`,
    `| _| `,
    `|_|  `
  ],
  [
    `  ___ `,
    ` / __|`,
    `| (_ |`,
    ` \\___|`
  ],
  [
    ` _  _ `,
    `| || |`,
    `| __ |`,
    `|_||_|`
  ],
  [
    ` ___ `,
    `|_ _|`,
    ` | | `,
    `|___|`
  ],
  [
    `    _ `,
    ` _ | |`,
    `| || |`,
    ` \\__/ `
  ],
  [
    ` _  __`,
    `| |/ /`,
    `| ' < `,
    `|_|\\_\\`
  ],
  [
    ` _    `,
    `| |   `,
    `| |__ `,
    `|____|`
  ],
  [
    ` __  __ `,
    `|  \\/  |`,
    `| |\\/| |`,
    `|_|  |_|`
  ],
  [
    ` _  _ `,
    `| \\| |`,
    `| .\` |`,
    `|_|\\_|`
  ],
  [
    `  ___  `,
    ` / _ \\ `,
    `| (_) |`,
    ` \\___/ `
  ],
  [
    ` ___ `,
    `| _ \\`,
    `|  _/`,
    `|_|  `
  ],
  [
    `  ___  `,
    ` / _ \\ `,
    `| (_) |`,
    ` \\__\\_\\`
  ],
  [
    ` ___ `,
    `| _ \\`,
    `|   /`,
    `|_|_\\`
  ],
  [
    ` ___ `,
    `/ __|`,
    `\\__ \\`,
    `|___/`
  ],
  [
    ` _____ `,
    `|_   _|`,
    `  | |  `,
    `  |_|  `
  ],
  [
    ` _   _ `,
    `| | | |`,
    `| |_| |`,
    ` \\___/ `
  ],
  [
    `__   __`,
    `\\ \\ / /`,
    ` \\ V / `,
    `  \\_/  `
  ],
  [
    `__      __`,
    `\\ \\    / /`,
    ` \\ \\/\\/ / `,
    `  \\_/\\_/  `
  ],
  [
    `__  __`,
    `\\ \\/ /`,
    ` >  < `,
    `/_/\\_\\`
  ],
  [
    `__   __`,
    `\\ \\ / /`,
    ` \\ V / `,
    `  |_|  `
  ],
  [
    ` ____`,
    `|_  /`,
    ` / / `,
    `/___|`
  ],
  [
    ` __ `,
    `| _|`,
    `| | `,
    `| | `,
    `|__|`
  ],
  [
    `__   `,
    `\\ \\  `,
    ` \\ \\ `,
    `  \\_\\`
  ],
  [
    ` __ `,
    `|_ |`,
    ` | |`,
    ` | |`,
    `|__|`
  ],
  [
    ` /\\ `,
    `|/\\|`
  ],
  [
    ` ___ `,
    `|___|`
  ],
  [
    ` _ `,
    `( )`,
    ` \\|`
  ],
  [
    ` __ _ `,
    `/ _\` |`,
    `\\__,_|`
  ],
  [
    ` _    `,
    `| |__ `,
    `| '_ \\`,
    `|_.__|`
  ],
  [
    ` __ `,
    `/ _|`,
    `\\__|`
  ],
  [
    `    _ `,
    ` __| |`,
    `/ _\` |`,
    `\\__,_|`
  ],
  [
    ` ___ `,
    `/ -_)`,
    `\\___|`
  ],
  [
    `  __ `,
    ` / _|`,
    `|  _|`,
    `|_|  `
  ],
  [
    ` __ _ `,
    `/ _\` |`,
    `\\__, |`,
    `|___/ `
  ],
  [
    ` _    `,
    `| |_  `,
    `| ' \\ `,
    `|_||_|`
  ],
  [
    ` _ `,
    `(_)`,
    `| |`,
    `|_|`
  ],
  [
    `   _ `,
    `  (_)`,
    `  | |`,
    ` _/ |`,
    `|__/ `
  ],
  [
    ` _   `,
    `| |__`,
    `| / /`,
    `|_\\_\\`
  ],
  [
    ` _ `,
    `| |`,
    `| |`,
    `|_|`
  ],
  [
    ` _ __  `,
    `| '  \\ `,
    `|_|_|_|`
  ],
  [
    ` _ _  `,
    `| ' \\ `,
    `|_||_|`
  ],
  [
    ` ___ `,
    `/ _ \\`,
    `\\___/`
  ],
  [
    ` _ __ `,
    `| '_ \\`,
    `| .__/`,
    `|_|   `
  ],
  [
    ` __ _ `,
    `/ _\` |`,
    `\\__, |`,
    `   |_|`
  ],
  [
    ` _ _ `,
    `| '_|`,
    `|_|  `
  ],
  [
    ` ___`,
    `(_-<`,
    `/__/`
  ],
  [
    ` _   `,
    `| |_ `,
    `|  _|`,
    ` \\__|`
  ],
  [
    ` _  _ `,
    `| || |`,
    ` \\_,_|`
  ],
  [
    `__ __`,
    `\\ V /`,
    ` \\_/ `
  ],
  [
    `__ __ __`,
    `\\ V  V /`,
    ` \\_/\\_/ `
  ],
  [
    `__ __`,
    `\\ \\ /`,
    `/_\\_\\`
  ],
  [
    ` _  _ `,
    `| || |`,
    ` \\_, |`,
    ` |__/ `
  ],
  [
    ` ___`,
    `|_ /`,
    `/__|`
  ],
  [
    ` `,
    ` `,
    ` `,
    ` `
  ],
  [
    ` _  `,
    `| | `,
    `|_| `,
    `(_) `
  ],
  [
    `###`,
    `###`,
    `###`,
    `###`
  ]
];
var getChar = (char) => {
  const code = char.charCodeAt(0);
  if (code >= 48 && code <= 57) {
    return smallFiGlet[code - 48];
  } else if (code >= 65 && code <= 90) {
    return smallFiGlet[code - 65 + 17];
  } else if (code >= 97 && code <= 122) {
    return smallFiGlet[code - 97 + 49];
  } else if (char == ":") {
    return smallFiGlet[10];
  } else if (char == ";") {
    return smallFiGlet[11];
  } else if (char == "(") {
    return smallFiGlet[12];
  } else if (char == ")") {
    return smallFiGlet[14];
  } else if (char == "?") {
    return smallFiGlet[15];
  } else if (char == "@") {
    return smallFiGlet[16];
  } else if (char == "[") {
    return smallFiGlet[43];
  } else if (char == "\\") {
    return smallFiGlet[44];
  } else if (char == "]") {
    return smallFiGlet[45];
  } else if (char == "^") {
    return smallFiGlet[46];
  } else if (char == ".") {
    return smallFiGlet[47];
  } else if (char == ",") {
    return smallFiGlet[48];
  } else if (char == "!") {
    return smallFiGlet[76];
  } else if (char == " ") {
    return smallFiGlet[75];
  } else {
    return smallFiGlet[77];
  }
};
var mergeChars = (char1, char2) => {
  const merged = [];
  const height = Math.max(char1.length, char2.length);
  if (char1.length == 0) {
    return char2;
  }
  if (char2.length == 0) {
    return char1;
  }
  if (char1.length < height) {
    for (let i = char1.length; i < height; i++) {
      char1.unshift(" ".repeat(char1[0].length));
    }
  }
  if (char2.length < height) {
    for (let i = char2.length; i < height; i++) {
      char2.unshift(" ".repeat(char2[0].length));
    }
  }
  const f_width = char1[0].length;
  const s_width = char2[0].length;
  for (let i = 0; i < height; i++) {
    let line = char1[i] + char2[i];
    merged.push(line);
  }
  return merged;
};
var getFiGlet = (str) => {
  const chars = str.split("");
  let merged = [[]];
  let currentLine = 0;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] == "\n") {
      currentLine++;
      merged[currentLine] = [];
      continue;
    }
    merged[currentLine] = mergeChars(merged[currentLine], getChar(chars[i]));
  }
  return merged.map((item) => item.join("\n")).join("\n");
};

// Simulator/Engine/ConsoleHelp.js
var ControlSequences = class {
  static get OSC() {
    return "\x1B]";
  }
  static get CSI() {
    return "\x1B[";
  }
  static get Reset() {
    return "\x1B[0m";
  }
};
var DefaultColors = class {
  static #BLACK = 30;
  static #RED = 31;
  static #GREEN = 32;
  static #YELLOW = 33;
  static #BLUE = 34;
  static #MAGENTA = 35;
  static #CYAN = 36;
  static #WHITE = 37;
  static #LIGHTBLACK_EX = 90;
  static #LIGHTRED_EX = 91;
  static #LIGHTGREEN_EX = 92;
  static #LIGHTYELLOW_EX = 93;
  static #LIGHTBLUE_EX = 94;
  static #LIGHTMAGENTA_EX = 95;
  static #LIGHTCYAN_EX = 96;
  static #LIGHTWHITE_EX = 97;
  static #BG_BLACK = 40;
  static #BG_RED = 41;
  static #BG_GREEN = 42;
  static #BG_YELLOW = 43;
  static #BG_BLUE = 44;
  static #BG_MAGENTA = 45;
  static #BG_CYAN = 46;
  static #BG_WHITE = 47;
  static #BG_RESET = 49;
  static get BLACK() {
    return this.#BLACK;
  }
  static set BLACK(value) {
    this.#BLACK = value;
  }
  static get RED() {
    return this.#RED;
  }
  static set RED(value) {
    this.#RED = value;
  }
  static get GREEN() {
    return this.#GREEN;
  }
  static set GREEN(value) {
    this.#GREEN = value;
  }
  static get YELLOW() {
    return this.#YELLOW;
  }
  static set YELLOW(value) {
    this.#YELLOW = value;
  }
  static get BLUE() {
    return this.#BLUE;
  }
  static set BLUE(value) {
    this.#BLUE = value;
  }
  static get MAGENTA() {
    return this.#MAGENTA;
  }
  static set MAGENTA(value) {
    this.#MAGENTA = value;
  }
  static get CYAN() {
    return this.#CYAN;
  }
  static set CYAN(value) {
    this.#CYAN = value;
  }
  static get WHITE() {
    return this.#WHITE;
  }
  static set WHITE(value) {
    this.#WHITE = value;
  }
  static get LIGHTBLACK_EX() {
    return this.#LIGHTBLACK_EX;
  }
  static set LIGHTBLACK_EX(value) {
    this.#LIGHTBLACK_EX = value;
  }
  static get LIGHTRED_EX() {
    return this.#LIGHTRED_EX;
  }
  static set LIGHTRED_EX(value) {
    this.#LIGHTRED_EX = value;
  }
  static get LIGHTGREEN_EX() {
    return this.#LIGHTGREEN_EX;
  }
  static set LIGHTGREEN_EX(value) {
    this.#LIGHTGREEN_EX = value;
  }
  static get LIGHTYELLOW_EX() {
    return this.#LIGHTYELLOW_EX;
  }
  static set LIGHTYELLOW_EX(value) {
    this.#LIGHTYELLOW_EX = value;
  }
  static get LIGHTBLUE_EX() {
    return this.#LIGHTBLUE_EX;
  }
  static set LIGHTBLUE_EX(value) {
    this.#LIGHTBLUE_EX = value;
  }
  static get LIGHTMAGENTA_EX() {
    return this.#LIGHTMAGENTA_EX;
  }
  static set LIGHTMAGENTA_EX(value) {
    this.#LIGHTMAGENTA_EX = value;
  }
  static get LIGHTCYAN_EX() {
    return this.#LIGHTCYAN_EX;
  }
  static set LIGHTCYAN_EX(value) {
    this.#LIGHTCYAN_EX = value;
  }
  static get LIGHTWHITE_EX() {
    return this.#LIGHTWHITE_EX;
  }
  static set LIGHTWHITE_EX(value) {
    this.#LIGHTWHITE_EX = value;
  }
  static get BG_BLACK() {
    return this.#BG_BLACK;
  }
  static set BG_BLACK(value) {
    this.#BG_BLACK = value;
  }
  static get BG_RED() {
    return this.#BG_RED;
  }
  static set BG_RED(value) {
    this.#BG_RED = value;
  }
  static get BG_GREEN() {
    return this.#BG_GREEN;
  }
  static set BG_GREEN(value) {
    this.#BG_GREEN = value;
  }
  static get BG_YELLOW() {
    return this.#BG_YELLOW;
  }
  static set BG_YELLOW(value) {
    this.#BG_YELLOW = value;
  }
  static get BG_BLUE() {
    return this.#BG_BLUE;
  }
  static set BG_BLUE(value) {
    this.#BG_BLUE = value;
  }
  static get BG_MAGENTA() {
    return this.#BG_MAGENTA;
  }
  static set BG_MAGENTA(value) {
    this.#BG_MAGENTA = value;
  }
  static get BG_CYAN() {
    return this.#BG_CYAN;
  }
  static set BG_CYAN(value) {
    this.#BG_CYAN = value;
  }
  static get BG_WHITE() {
    return this.#BG_WHITE;
  }
  static set BG_WHITE(value) {
    this.#BG_WHITE = value;
  }
  static get BG_RESET() {
    return this.#BG_RESET;
  }
  static set BG_RESET(value) {
    this.#BG_RESET = value;
  }
  /// Custom colors 8 bit
  /// 0-7: standard colors (as in DefaultColors.Color)
  /// cheat code for the 8 bit color: https://hexdocs.pm/color_palette/ansi_color_codes.html
  /// if num is an array of exactly 3 numbers, it will be a 24bit RGB color
  static custom_colors(num, background = false) {
    let text = "38";
    if (background) {
      text = "48";
    }
    if (Array.isArray(num)) {
      if (num.length === 3) {
        text += `;2;${num[0]};${num[1]};${num[2]}`;
      } else {
        return text + `;5;${num[0]}`;
      }
      return text;
    } else {
      return text + `;5;${num}`;
    }
  }
};
var Decorations = class {
  static get Bold() {
    return 1;
  }
  static get Dim() {
    return 2;
  }
  static get Italic() {
    return 3;
  }
  static get Underlined() {
    return 4;
  }
  static get Blink() {
    return 5;
  }
  static get Reverse() {
    return 7;
  }
  static get Strikethrough() {
    return 9;
  }
  static get no_underline() {
    return 24;
  }
};
var ConsoleNotImplemented = class extends Error {
  constructor() {
    super("The ConsoleHelper was not properly implemented.");
    this.name = "ConsoleError";
  }
};
var ConsoleImplementation = class {
  //
  // Strictly Abstract 
  //
  // Should only throw error if a not implement NESCESSARY feature is tryng to be used
  fillBar = () => {
    throw new ConsoleNotImplemented();
  };
  insert_color = () => {
    throw new ConsoleNotImplemented();
  };
  insert_format = () => {
    throw new ConsoleNotImplemented();
  };
  clear_screen = () => {
    throw new ConsoleNotImplemented();
  };
  clear_line = () => {
    throw new ConsoleNotImplemented();
  };
  clear_last_line = () => {
    throw new ConsoleNotImplemented();
  };
  getWidth = () => {
    throw new ConsoleNotImplemented();
  };
  show_cursor = () => {
    throw new ConsoleNotImplemented();
  };
  print = () => {
    throw new ConsoleNotImplemented();
  };
  setTitle = () => {
    throw new ConsoleNotImplemented();
  };
};
var BasicConsole = class _BasicConsole extends ConsoleImplementation {
  static #instance = null;
  //Singleton instance
  constructor() {
    if (_BasicConsole.#instance) {
      return _BasicConsole.#instance;
    } else {
      super();
      _BasicConsole.#instance = this;
    }
  }
  /// Already done by the constructor
  /// but here for completeness sake.
  getInstance() {
    return _BasicConsole.#instance;
  }
  breakLine = (text, width, ignorenl = false) => {
    if (ignorenl) {
      text = text.replaceAll("\n", " ");
    }
    let words = text.split(" ");
    let lines = [];
    let line = "";
    words.forEach((word) => {
      const lineLength = this.getLineWidth(line);
      const wordLength = this.getLineWidth(word);
      if (lineLength + wordLength > width) {
        lines.push(line);
        line = "";
      }
      line += word + " ";
    });
    lines.push(line);
    return lines.join("\n");
  };
  clear_screen = () => {
    console.clear();
  };
  write = (text) => {
    process.stdout.write(text);
  };
  clear_line = () => {
    this.write(ControlSequences.CSI + `2K`);
  };
  clear_last_line = (times) => {
    for (let i = 0; i < (times || 1); i++) {
      this.write("\x1B[1A");
      this.clear_line();
    }
  };
  getWidth = () => {
    return process.stdout.columns;
  };
  show_cursor = (value = true) => {
    if (value)
      this.write("\x1B[?25h");
    else
      this.write("\x1B[?25l");
  };
  insert_color = (color, text, oldColor) => {
    return ControlSequences.CSI + color + `m` + text + ControlSequences.Reset;
  };
  insert_format = (format = {
    color: DefaultColors.WHITE,
    background: DefaultColors.BG_BLACK,
    decoration: Decorations.None
  }, text) => {
    if (!text) return "";
    let fmt = "";
    let addSemi = false;
    if (format.color) {
      fmt += format.color;
      addSemi = true;
    }
    if (format.background) {
      if (addSemi)
        fmt += ";";
      fmt += format.background;
      addSemi = true;
    }
    if (format.decoration) {
      let decorationArray = [];
      if (!Array.isArray(format.decoration))
        decorationArray = [format.decoration];
      else
        decorationArray = format.decoration;
      decorationArray.forEach((item) => {
        if (addSemi)
          fmt += ";";
        fmt += item;
        addSemi = true;
      });
    }
    if (text.includes(ControlSequences.Reset)) {
      const color = format.color || DefaultColors.WHITE;
      text = text.replaceAll(ControlSequences.Reset, ControlSequences.Reset + ControlSequences.CSI + fmt + `m`);
    }
    return ControlSequences.CSI + fmt + `m` + text + ControlSequences.Reset;
  };
  fillBar = (percent, size, char, color, bg_color) => {
    if (typeof percent !== "number")
      throw new Error("Percent must be a number");
    if (typeof size !== "number" || size < 1)
      throw new Error("Size must be a positive integer");
    if (typeof char !== "string" || char.length !== 1)
      throw new Error("Char must be exactly 1 char");
    percent = Math.max(percent, 0);
    percent = Math.min(percent, 1);
    const cut_off = Math.round(percent * size);
    let line = this.insert_color(color, char.repeat(cut_off)) + this.insert_color(bg_color, char.repeat(size - cut_off));
    return line;
  };
  printOptions = (options, selectIndex = 0, config2, vertical = false) => {
    let res = "";
    const padChar = " ";
    let padding = padChar.repeat(3);
    if (config2 && config2.padding) {
      padding = padChar.repeat(config2.padding);
    }
    const width = this.getWidth();
    const totalLength = options.reduce((acc, item) => acc + item.length, 0) + padding.length * options.length;
    if (totalLength > width) {
      padding = " ".repeat(0);
    }
    for (let i = 0; i < options.length; i++) {
      let line = `  ${options[i]}  `;
      if (i === selectIndex)
        line = `> ${options[i]} <`;
      if (vertical) {
        res += this.hcenter(line, width, padChar);
        res += "\n";
      } else {
        res += line;
        res += padding;
      }
    }
    res = this.hcenter(res, width);
    if (this.getLineWidth(res) > width && !vertical) {
      res = res.substring(0, width);
    }
    res = res.replace(options[selectIndex], this.insert_format({
      decoration: Decorations.Underlined
    }, options[selectIndex]));
    res = res.replaceAll(">", this.insert_color(DefaultColors.YELLOW, ">"));
    res = res.replaceAll("<", this.insert_color(DefaultColors.YELLOW, "<"));
    if (config2 && Array.isArray(config2.colors)) {
      config2.colors.forEach((item) => {
        res = res.replaceAll(item.text, this.insert_color(item.color, item.text));
      });
    }
    this.print(res);
    return res;
  };
  // Horizontal center a line, mode => 0 = center, 1 = left, 2 = right
  // MultiLine text is supported, each line will be centered
  // if treatAsRaw is true, it will treat the input as a single line
  hcenter = (input, size = -1, char = " ", mode = 0) => {
    if (typeof input !== "string") return "";
    if (size < 0) {
      size = this.getWidth();
    }
    if (typeof mode === "string") {
      if (mode === "left") mode = 1;
      else if (mode === "right") mode = 2;
      else mode = 0;
    }
    ;
    const centerLine = (text) => {
      if (typeof text !== "string") return void 0;
      let start = mode !== 1;
      while (this.getLineWidth(text) < size) {
        if (start) text = char + text;
        else text += char;
        if (mode === 0)
          start = !start;
      }
      return text;
    };
    if (input.includes("\n")) {
      let lines = input.split("\n");
      lines = lines.map((line) => centerLine(line));
      return lines.join("\n");
    }
    return centerLine(input);
  };
  // Vertical center a sprite, mode => 0 = center, 1 = top, 2 = bottom
  // input should be an array of strings
  vcenter = (input, verticalLength, horizontalLength, char = " ", mode = 0) => {
    let input_is_str = false;
    if (typeof input === "string") {
      input = input.split("\n");
      input_is_str = true;
    }
    const diff = verticalLength - input.length;
    let center = mode === 2;
    for (let i = 0; i < diff; i++) {
      if (center)
        input.push(char.repeat(horizontalLength));
      else
        input.unshift(char.repeat(horizontalLength));
      if (mode === 0)
        center = !center;
    }
    if (input_is_str) {
      input = input.join("\n");
    }
    return input;
  };
  // Merge two sprites to be printed together
  // If you need Colors, you can pass an array of objects with the text and color
  // but only use at the last merged you do before printing to the console.
  merge = (leftSprite, rightSprite, options = {}) => {
    if (typeof leftSprite !== "string" || typeof rightSprite !== "string") return void 0;
    let rightLines = rightSprite.split("\n");
    let leftLines = leftSprite.split("\n");
    const maxLengthLeft = Math.max(...leftLines.map((line) => this.getLineWidth(line)));
    const maxLengthRight = Math.max(...rightLines.map((line) => this.getLineWidth(line)));
    if (options?.align && rightLines.length != leftLines.length) {
      if (options.align == "top") {
        let diff = leftLines.length - rightLines.length;
        while (diff !== 0) {
          if (diff > 0) {
            rightLines.push(" ".repeat(maxLengthRight));
            diff--;
          } else {
            leftLines.push(" ".repeat(maxLengthLeft));
            diff++;
          }
        }
      } else if (options.align == "bottom") {
        let diff = leftLines.length - rightLines.length;
        while (diff !== 0) {
          if (diff > 0) {
            rightLines.unshift(" ".repeat(maxLengthRight));
            diff--;
          } else {
            leftLines.unshift(" ".repeat(maxLengthLeft));
            diff++;
          }
        }
      }
    }
    if (options.left && options.left.align) {
      if (options.left.align === "hcenter") {
        leftLines = leftLines.map((line) => this.hcenter(line, maxLengthLeft, " "));
      } else if (options.left.align === "vcenter") {
        this.vcenter(leftLines, rightLines.length, maxLengthLeft, " ");
      }
    }
    if (options.right && options.right.align) {
      if (options.right.align === "hcenter") {
        rightLines = rightLines.map((line) => this.hcenter(line, maxLengthRight, " "));
      } else if (options.right.align === "vcenter") {
        this.vcenter(rightLines, leftLines.length, maxLengthRight, " ");
      }
    }
    let mergedLines = leftLines.map((line, index) => {
      const sentenceLine = rightLines[index] || " ".repeat(maxLengthRight);
      let padding = options.padding || 4;
      if (options?.padding == 0)
        padding = 0;
      return line.padEnd(maxLengthLeft, " ") + " ".repeat(padding) + sentenceLine;
    }).join("\n");
    if (Array.isArray(options.colors)) {
      options.colors.forEach((item) => {
        if (Array.isArray(item.text)) {
          item.text.forEach((text) => mergedLines = mergedLines.replaceAll(text, this.insert_color(item.color, text)));
        } else
          mergedLines = mergedLines.replaceAll(item.text, this.insert_color(item.color, item.text));
      });
    }
    return mergedLines;
  };
  paintSprite = (sprite, hcutoff, color) => {
    const sprite_array = sprite.split("\n");
    let res = "";
    sprite_array.forEach((element) => {
      res += this.insert_color(color, element.substring(0, hcutoff));
      res += element.substring(hcutoff);
      res += "\n";
    });
    return res;
  };
  getLineWidth = (text) => {
    if (!text) return 0;
    let line = text;
    while (line.includes(ControlSequences.CSI)) {
      const csi_index = line.indexOf(ControlSequences.CSI);
      const end_csi = line.indexOf("m", csi_index);
      let end = "";
      if (end_csi + 1 < line.length && end_csi > 0)
        end = line.substring(end_csi + 1);
      line = line.substring(0, csi_index) + end;
    }
    return line.length;
  };
  pressSpace = (phrase = "to continue") => {
    const width = this.getWidth();
    let final_phrase = `Press Spacebar ${phrase}.`;
    final_phrase = this.hcenter(final_phrase, width);
    final_phrase = final_phrase.replaceAll(
      "Spacebar",
      this.insert_format({
        color: DefaultColors.YELLOW,
        decoration: [Decorations.Underlined, Decorations.Blink]
      }, "Space")
    );
    this.print(final_phrase);
  };
  print = (text) => {
    if (typeof text === "undefined") {
      this.write("\n");
    } else {
      this.write(text + "\n");
    }
  };
  controlPrint = (text) => {
    if (typeof text === "undefined") {
      this.write("\n");
      return 1;
    } else {
      this.write(text + "\n");
      let startindex = 0;
      let count = 1;
      while (startindex != -1) {
        startindex = text.indexOf("\n", startindex);
        if (startindex != -1) {
          count++;
          startindex++;
        }
      }
      return count;
    }
  };
  setTitle = (title) => {
    this.write("\x1B]2;" + title + "\x1B\\");
  };
  // Print a line centered in the console
  hprint = (text) => {
    if (typeof text === "undefined") {
      this.write("\n");
    } else
      this.write(this.hcenter(text, this.getWidth()) + "\n");
  };
  // Print a line centered in the console without \n at the end
  hwrite = (text) => {
    if (typeof text === "undefined") {
      this.write("\n");
    } else
      this.write(this.hcenter(text, this.getWidth()));
  };
  // Get a substring of a string, ignoring escape sequences
  // start and end are the indexes of the text without escape sequences
  getSafeSubstring = (text, start, end = 0) => {
    if (typeof text !== "string") return "";
    const realLen = this.getLineWidth(text);
    const a = start;
    const b = end;
    if (end > realLen) end = realLen;
    if (end < 0) end = realLen + end;
    if (start < 0) start = realLen + start;
    let trueIndex = 0;
    let startIndex = 0;
    let endIndex = text.length - 1;
    let cmd = false;
    let openEsc = false;
    let recomposeEsc = "";
    let oldOpenEsc = "";
    for (let i = 0; i < text.length; i++) {
      if (cmd == true) {
        if (text[i] == "m") {
          cmd = false;
        }
        oldOpenEsc += text[i];
      } else if (cmd == false) {
        if (text[i] == "\x1B") {
          cmd = true;
          openEsc = !openEsc;
          oldOpenEsc = text[i];
        } else {
          if (trueIndex == start) {
            if (openEsc) {
              recomposeEsc = oldOpenEsc;
            }
            startIndex = i;
          }
          if (trueIndex == end) {
            endIndex = i;
            break;
          }
          trueIndex++;
        }
      }
    }
    let res = text.substring(startIndex, endIndex + 1);
    if (openEsc == true || cmd == true) {
      res += ControlSequences.Reset;
    }
    if (recomposeEsc != "") {
      res = recomposeEsc + res;
    }
    return res;
  };
  // Animate a sprite, ms is the time between each character, onEnd is a function to call when the animation ends
  animate = (sprite, ms, onEnd = null, center = false) => {
    const textArray = sprite.split("\n");
    const hval = Math.max(...textArray.map((item) => this.getLineWidth(item)));
    const get_partial = (sprite2, index) => {
      let res = "";
      sprite2.forEach((element) => {
        let line = this.getSafeSubstring(element, 0, index);
        if (center) {
          line = this.hcenter(line);
        }
        res += line;
        res += "\n";
      });
      return res;
    };
    const render = (index) => {
      this.clear_screen();
      this.print(get_partial(textArray, index));
      if (index < hval) {
        setTimeout(() => {
          render(index + 1);
        }, ms);
      } else {
        if (onEnd) {
          onEnd();
        }
      }
    };
    render(0);
  };
  // Paint a sprite with a color, the color will be applied to each line of the sprite
  paint = (sprite, color) => {
    if (!color) {
      return sprite;
    }
    const sprite_array = sprite.split("\n").map((line) => {
      return this.insert_color(color, line);
    }).join("\n");
    return sprite_array;
  };
  /**
   * Prints stylized text using figlet with optional formatting, coloring, and centering.
   *
   * @param {string} text - The text to be stylized and printed.
   * @param {Object} [options] - Optional settings for styling the text.
   * @param {boolean} [options.center=true] - Whether to center the text horizontally.
   * @param {string} [options.color] - The color to apply to the text.
   * @param {string} [options.format] - The format to apply to the text (e.g., bold, italic).
   */
  getFigLet = (text, options) => {
    let figlet = getFiGlet(text);
    let center = options?.center;
    if (typeof center === "undefined") {
      center = true;
    }
    if (options?.color) {
      figlet = figlet.split("\n").map((line) => this.insert_color(options.color, line)).join("\n");
    }
    if (options?.format) {
      figlet = figlet.split("\n").map((line) => this.insert_format(options.format, line)).join("\n");
    }
    if (center) {
      figlet = this.hcenter(figlet);
    }
    return figlet;
  };
  getHeight = () => {
    return process.stdout.rows;
  };
  getSize = (text) => {
    if (typeof text !== "string") return { width: 0, height: 0 };
    const w = text.split("\n").reduce((max, line) => Math.max(max, this.getLineWidth(line)), 0);
    const h = text.split("\n").length;
    return { width: w, height: h };
  };
  printAtPos = (text, x, y) => {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      this.set_cursor_pos(x, y + i);
      this.write(lines[i]);
    }
  };
  set_cursor_pos = (x, y) => {
    if (x < 0)
      x = this.getWidth() + x;
    if (y < 0)
      y = this.getHeight() + y;
    this.write(ControlSequences.CSI + y + ";" + x + "H");
  };
  matchAndReplace = (text, array = []) => {
    for (let i = 0; i < array.length; i++) {
      if (typeof array[i].text !== "string") continue;
      if (typeof array[i].format !== "object") continue;
      text = text.replaceAll(array[i].text, this.insert_format(array[i].format, array[i].text));
    }
    return text;
  };
  home_cursor = () => {
    this.write("\x1B[0f");
  };
};

// main.js
var import_process = __toESM(require("process"), 1);
var import_readline = __toESM(require("readline"), 1);

// Simulator/Algorthims/SchedulerAlgorithm.js
var SchedulerAlgorithms = class {
  constructor() {
    this.name = "No Algorithm";
    this.description = "No description available";
  }
  sortTasks(tasks, t2) {
    throw new Error("sortTasks() must be implemented in subclasses");
  }
};

// Simulator/Algorthims/EDF.js
var EDFAlgorithm = class extends SchedulerAlgorithms {
  constructor() {
    super();
    this.tasks = [];
    this.name = "Earlier Deadline First";
  }
  sortTasks(tasks, t2) {
    return tasks.sort((a, b) => {
      if (a.deadline === null && b.deadline === null) {
        return a.arrivalTime - b.arrivalTime;
      }
      if (a.deadline === null) {
        return 1;
      }
      if (b.deadline === null) {
        return -1;
      }
      return a.arrivalTime + a.deadline - (b.arrivalTime + b.deadline);
    });
  }
};

// Simulator/Algorthims/HRRN.js
var HRRNAlgorithm = class extends SchedulerAlgorithms {
  constructor() {
    super();
    this.tasks = [];
    this.name = "Highest Response Ratio Next (HRRN)";
  }
  calculateResponseRatio(task, currentTime) {
    const waitTime = currentTime - task.arrivalTime;
    const serviceTime = task.burstTime - task.remainingTime;
    if (serviceTime === 0) {
      return Infinity;
    }
    return (waitTime + serviceTime) / serviceTime;
  }
  sortTasks(tasks, t2) {
    return tasks.sort((a, b) => {
      if (this.calculateResponseRatio(a, t2) === this.calculateResponseRatio(b, t2)) {
        return a.priority - b.priority;
      }
      return this.calculateResponseRatio(b, t2) - this.calculateResponseRatio(a, t2);
    });
  }
};

// Simulator/Algorthims/FCFS.js
var FCFSAlgorithm = class extends SchedulerAlgorithms {
  constructor() {
    super();
    this.tasks = [];
    this.name = "First Come First Served (FCFS)";
  }
  sortTasks(tasks, t2) {
    return tasks.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }
};

// Simulator/Algorthims/PriorityFirst.js
var PriorityFirst = class extends SchedulerAlgorithms {
  constructor() {
    super();
    this.tasks = [];
    this.name = "Priority First";
  }
  sortTasks(tasks, t2) {
    return tasks.sort((a, b) => {
      if (a.priority === b.priority) {
        return a.arrivalTime - b.arrivalTime;
      }
      return b.priority - a.priority;
    });
  }
};

// Simulator/Algorthims/RoundRobin.js
var RoundRobin = class extends SchedulerAlgorithms {
  constructor(timeQuantum) {
    super();
    this.queue = [];
    this.name = "Round Robin";
    this.timeQuantum = timeQuantum;
  }
  sortTasks(tasks, t2) {
    if (this.queue.length === 0) {
      const orderedTasks = tasks.sort(
        (a, b) => {
          if (a.arrivalTime === b.arrivalTime) {
            return a.priority - b.priority;
          }
          return a.arrivalTime - b.arrivalTime;
        }
      ).slice();
      for (let i = 0; i < orderedTasks.length; i++) {
        this.queue.push({ task: orderedTasks[i], timeRemaining: this.timeQuantum });
      }
    }
    for (let i = 0; i < tasks.length; i++) {
      const exist = this.queue.find((task) => task.task.id === tasks[i].id);
      if (!exist) {
        this.queue.push({ task: tasks[i], timeRemaining: this.timeQuantum });
      }
    }
    for (let i = 0; i < this.queue.length; i++) {
      const exist = tasks.find((task) => task.id === this.queue[i].task.id);
      if (!exist) {
        this.queue.splice(i, 1);
        i--;
      }
    }
    return this.queue.map((item) => item.task);
  }
  consumeTasks(tasks) {
    for (const task of tasks) {
      if (!task)
        continue;
      const taskInQueue = this.queue.find((t2) => t2.task.id === task.id);
      if (taskInQueue) {
        taskInQueue.timeRemaining -= 1;
        if (taskInQueue.timeRemaining <= 0) {
          this.queue.splice(this.queue.indexOf(taskInQueue), 1);
          this.queue.push({ task, timeRemaining: this.timeQuantum });
        }
      } else {
        throw new Error(`Task with ID ${task.id} not found in the queue. This should not happen.`);
      }
    }
  }
};

// Simulator/Algorthims/SJF.js
var SJFAlgorithm = class extends SchedulerAlgorithms {
  constructor() {
    super();
    this.name = "Shortest Job First (SJF)";
    this.description = "Tasks are sorted based on their burst time in ascending order.";
  }
  sortTasks(tasks, t2) {
    return tasks.sort((a, b) => {
      if (a.remainingTime === b.remainingTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return a.remainingTime - b.remainingTime;
    });
  }
};

// Simulator/Algorthims/AlgoFactory.js
var AlgorithmModels = class _AlgorithmModels {
  static get FCFS() {
    return 0;
  }
  static get RR() {
    return 1;
  }
  static get EDF() {
    return 2;
  }
  static get Priority() {
    return 3;
  }
  static get SJF() {
    return 4;
  }
  static get HRRN() {
    return 5;
  }
  static get length() {
    return 6;
  }
  static getName(type) {
    switch (type) {
      case _AlgorithmModels.FCFS:
        return "FCFS";
      case _AlgorithmModels.RR:
        return "RR";
      case _AlgorithmModels.EDF:
        return "EDF";
      case _AlgorithmModels.Priority:
        return "Priority";
      case _AlgorithmModels.SJF:
        return "SJF";
      case _AlgorithmModels.HRRN:
        return "HRRN";
      default:
        throw new Error(`Unknown algorithm type: ${type}`);
    }
  }
};
var AlgoFactory = class {
  static createAlgorithm(type, options) {
    if (type === AlgorithmModels.FCFS) {
      return new FCFSAlgorithm();
    }
    if (type === AlgorithmModels.EDF) {
      return new EDFAlgorithm();
    }
    if (type === AlgorithmModels.FiFo) {
      return new FCFSAlgorithm();
    }
    if (type === AlgorithmModels.Priority) {
      return new PriorityFirst();
    }
    if (type === AlgorithmModels.RR) {
      return new RoundRobin(options?.timeQuantum);
    }
    if (type === AlgorithmModels.SJF) {
      return new SJFAlgorithm();
    }
    if (type === AlgorithmModels.HRRN) {
      return new HRRNAlgorithm();
    }
    throw new Error(`Unknown algorithm type: ${type}`);
  }
};

// Simulator/Scheduler/Scheduler.js
var CH = new BasicConsole();
var TaskStates = class {
  static ready = CH.insert_color(DefaultColors.GREEN, "READY");
  static running = CH.insert_color(DefaultColors.YELLOW, "RUNNING");
  static failed = CH.insert_color(DefaultColors.RED, "FAILED");
  static completed = CH.insert_color(DefaultColors.BLUE, "COMPLETED");
};
var SchedulerSnapshot = class {
  /**
   * Creates an instance of SchedulerSnapshot.
   * 
   * @param {number} t - The current time in time units.
   * @param {string} model - The name of the scheduling algorithm used.
   * @param {number} numProcessors - The number of processors available.
   * @param {Array} currentTasks - An array of tasks currently running on each processor.
   * @param {Array} tasks - An array of all tasks in the system.
   * @param {Array} validTasks - An array of tasks that are valid for scheduling.
   */
  constructor(t2, model, numProcessors, currentTasks, tasks, validTasks) {
    this.t = t2;
    this.model = model;
    this.numProcessors = numProcessors;
    this.currentTasks = currentTasks;
    this.tasks = tasks;
    this.validTasks = validTasks;
  }
};
var Task = class {
  /**
   * Creates a new Task instance.
   * @param {number} burstTime - The burst time of the task in time units.
   * @param {number} [priority=0] - The priority of the task (0 is the highest priority).
   * @param {number|null} [deadline=null] - The deadline of the task in time units, or null if no deadline.
   * @param {number|null} [pinToCore=null] - The core to which the task is pinned, or null if no pinning.
   */
  constructor(burstTime, priority = 0, deadline = null, pinToCore = null) {
    this.id = null;
    this.burstTime = burstTime;
    this.remainingTime = burstTime;
    this.arrivalTime = null;
    this.completedTime = null;
    this.turnAround = null;
    this.responseTime = null;
    this.waitingTime = null;
    this.priority = priority;
    this.deadline = deadline;
    this.pinToCore = pinToCore;
    this.status = "CREATED";
    this.color = 0;
    this.period = null;
    this.format = {
      color: DefaultColors.RED,
      background: null,
      char: "*"
    };
  }
  /**
   * Assigns an ID to the task.
   * @param {number} id - The unique identifier for the task.
   */
  assignId(id) {
    this.id = id;
  }
  /**
   * Checks the task's status and updates it if completed.
   * @param {number} t - The current time in the simulation.
   */
  checkTask(t2) {
    if (this.remainingTime <= 0 && this.status !== TaskStates.completed) {
      this.status = TaskStates.completed;
      this.completedTime = t2;
    }
    this.checkDeadline(t2);
  }
  /**
   * Checks if the task has missed its deadline.
   * @param {number} t - The current time in the simulation.
   * @returns {boolean} - Returns true if the deadline is not missed, false otherwise.
   */
  checkDeadline(t2) {
    if (this.deadline && this.remainingTime > 0 && t2 >= this.arrivalTime + this.deadline && this.status !== TaskStates.failed) {
      this.status = TaskStates.failed;
      this.completedTime = t2;
      this.turnAround = t2 - this.arrivalTime;
      this.waitingTime = this.turnAround - this.burstTime;
      return false;
    }
    return true;
  }
  /**
   * Simulates the passage of one time unit for the task.
   * Updates response time and decrements remaining time if applicable.
   * @param {number} t - The current time in the simulation.
   */
  tick(t2) {
    if (this.responseTime === null) {
      this.responseTime = t2 - this.arrivalTime;
    }
    if (this.remainingTime > 0) {
      this.remainingTime -= 1;
    }
  }
  /**
  * Sets the display format for the task.
  * @param {Object} format - The format object containing color, background, and character properties.
  */
  setFormat(format) {
    this.format = format;
  }
  /**
   * Resets the task's timers and status to their initial state.
   * @static
   * @param {Task} task - The task instance to reset.
   */
  static resetTimers(task) {
    task.remainingTime = task.burstTime;
    task.completedTime = null;
    task.turnAround = null;
    task.responseTime = null;
    task.arrivalTime = null;
    task.waitingTime = null;
  }
  /**
   * Generates a visual representation of the task as a line.
   * @static
   * @param {Task} task - The task instance to generate the line for.
   * @param {number} [size=1] - The size of the line to generate.
   * @returns {string} - The generated line representation of the task.
   */
  static getLine(task, size = 1) {
    let line = task.format.char.repeat(size);
    line = " ".repeat(size);
    if (task.format.color) {
      line = CH.insert_color(task.format.color.replace("38", "48"), line);
    }
    return line;
  }
};
var Scheduler = class {
  #taskIDs = 0;
  constructor() {
    this.numProcessors = 1;
    this.tasks = [];
    this.currentTasks = Array(1);
    this.lastValidTasks = [];
    this.model = AlgoFactory.createAlgorithm(AlgorithmModels.SJF, { timeQuantum: 1 });
    this.t = 0;
  }
  configure(config2) {
    if (!config2) {
      console.log("config: ", config2);
      throw new Error("Invalid configuration object");
    }
    const getValue = (name, defaultValue) => {
      const value = config2.find((item) => item.name === name)?.value;
      return value !== void 0 ? value : defaultValue;
    };
    this.numProcessors = getValue("Processors", 1);
    this.currentTasks = Array(this.numProcessors);
    this.lastValidTasks = [];
    this.model = AlgoFactory.createAlgorithm(getValue("Scheduler Algorithm", AlgorithmModels.FCFS), { timeQuantum: getValue("Time Quantum", 1) });
    this.t = 0;
    for (const task of this.tasks) {
      Task.resetTimers(task);
      task.arrivalTime = this.t;
      task.status = TaskStates.ready;
    }
  }
  addTask(task) {
    if (task instanceof Task === false) {
      throw new Error("Task is not an instance of Task class");
    }
    if (task.id === null) {
      task.assignId(this.#taskIDs);
      this.#taskIDs += 1;
    } else {
      Task.resetTimers(task);
    }
    task.arrivalTime = this.t;
    task.status = TaskStates.ready;
    this.tasks.push(task);
  }
  addRandomTask() {
    const task = new Task(Math.round(Math.random() * 10 + 1), Math.round(Math.random() * 10 + 1), Math.random() > 0.5 ? null : Math.round(Math.random() * 10 + 1));
    if (Math.random() > 0.5) {
      task.pinToCore = Math.floor(Math.random() * this.numProcessors);
    }
    task.setFormat({
      color: DefaultColors.custom_colors(Math.round(Math.random() * 255)),
      background: DefaultColors.custom_colors(Math.round(Math.random() * 255, true)),
      char: Math.random() > 0.5 ? "*" : "#"
    });
    task.color = Math.round(Math.random() * 255);
    this.addTask(task);
  }
  getSnapshot() {
    const cpy_tasks = JSON.parse(JSON.stringify(this.tasks));
    const cpy_currentTasks = JSON.parse(JSON.stringify(this.currentTasks));
    const cpy_valid_tasks = JSON.parse(JSON.stringify(this.lastValidTasks));
    return new SchedulerSnapshot(
      this.t - 1,
      // time -1 since we do t+=1 at the end of the tick
      this.model.name,
      // name of the algorithm used
      this.numProcessors,
      // number of processors (Shouldnt change between snapshots)
      cpy_currentTasks,
      // copy of the currentTasks
      cpy_tasks,
      // copy of the tasks
      cpy_valid_tasks
      // copy of the valid tasks. this should be sorted as seen by the scheduler
    );
  }
  tick() {
    this.tasks.forEach(
      (task) => {
        task.checkTask(this.t - 1);
        if (task.remainingTime > 0 && task.status === TaskStates.running)
          task.status = TaskStates.ready;
        if (task.period && task.arrivalTime + task.period >= this.t) {
          this.addTask(task);
        }
      }
    );
    const validtasks = this.model.sortTasks(this.tasks.filter((task) => task.status === TaskStates.ready));
    this.lastValidTasks = validtasks;
    this.currentTasks = Array(this.numProcessors).fill(null);
    let assigned = 0;
    let validTaskIndex = 0;
    let currentCore = 0;
    while (assigned < this.numProcessors) {
      if (this.currentTasks[currentCore] !== null) {
        currentCore++;
        continue;
      }
      if (validtasks[validTaskIndex]) {
        if (validtasks[validTaskIndex].pinToCore !== null) {
          if (this.currentTasks[validtasks[validTaskIndex].pinToCore] !== null) {
            if (this.currentTasks[validtasks[validTaskIndex].pinToCore].pinToCore === null) {
              this.currentTasks[currentCore] = this.currentTasks[validtasks[validTaskIndex].pinToCore];
              this.currentTasks[validtasks[validTaskIndex].pinToCore] = validtasks[validTaskIndex];
              assigned++;
            } else {
            }
          } else {
            this.currentTasks[validtasks[validTaskIndex].pinToCore] = validtasks[validTaskIndex];
            assigned++;
          }
        } else {
          this.currentTasks[currentCore] = validtasks[validTaskIndex];
          assigned++;
          currentCore++;
        }
        validTaskIndex++;
      } else {
        assigned++;
      }
    }
    for (let i = 0; i < this.currentTasks.length; i++) {
      if (this.currentTasks[i] !== null) {
        this.currentTasks[i].status = TaskStates.running;
        this.currentTasks[i].tick(this.t);
      }
    }
    if (this.model.consumeTasks) {
      this.model.consumeTasks(this.currentTasks);
    }
    this.t += 1;
  }
};

// Simulator/Engine/messageBox.js
var CH2 = new BasicConsole();
var Colors = DefaultColors;
var Decorations2 = Decorations;
var msgbox = (text, title = "", options = [], select = -1) => {
  const w = Math.round(CH2.getWidth() / 2);
  const h = Math.round(CH2.getHeight() / 4);
  const lines = text.split("\n");
  const start_w = Math.round(w / 2);
  const start_h = Math.round((CH2.getHeight() - h) / 2);
  let restricted_lines = options.length > 0 ? 1 : 0;
  const hLine = CH2.insert_format({ color: Colors.LIGHTBLACK_EX, decoration: Decorations2.Bold }, "+" + "-".repeat(w - 2) + "+");
  const sidePiece = CH2.insert_format({ color: Colors.LIGHTBLACK_EX, decoration: Decorations2.Bold }, "|");
  let str = hLine + "\n";
  if (title != "") {
    restricted_lines++;
    title = CH2.insert_format({
      decoration: Decorations2.Bold
    }, title);
    title = CH2.hcenter(title, w - 2, " ");
  }
  ;
  let textLines = "";
  for (let i = 0; i < h - (2 + restricted_lines); i++) {
    if (lines[i]) {
      CH2.breakLine(lines[i], w - 2).split("\n").forEach((line) => {
        textLines += CH2.hcenter(line, w - 2) + "\n";
      });
    }
  }
  textLines = textLines.slice(0, -1);
  const hLen = textLines.split("\n").reduce((acc, line) => {
    return Math.max(acc, CH2.getLineWidth(line));
  }, 0);
  textLines = CH2.vcenter(textLines, h - (2 + restricted_lines) - 1, hLen, " ", 2);
  textLines = " ".repeat(w - 2) + "\n" + textLines;
  const optSize = Math.floor((w - 2) / options.length);
  let opts = "";
  for (let i = 0; i < options.length; i++) {
    let line = `${i === select ? "> " : "  "}${options[i]}${i === select ? " <" : "  "}`;
    if (i === select) {
      line = CH2.insert_format({
        decoration: Decorations2.Bold,
        color: Colors.RED
      }, line);
    }
    line = CH2.hcenter(line, optSize, " ");
    opts += line;
  }
  if (title != "")
    textLines = title + "\n" + textLines;
  if (options.length > 0)
    textLines += "\n" + CH2.hcenter(opts, w - 2) + "\n";
  const side = (sidePiece + "\n").repeat(h - 2) + sidePiece;
  textLines = CH2.merge(side, textLines, { padding: 0 });
  textLines = CH2.merge(textLines, side, { padding: 0 });
  str += textLines;
  str += "\n" + hLine;
  const box = str.split("\n");
  let final = box.slice(0, 1) + "\n";
  final += box.slice(1, -1).map((line) => {
    const start = CH2.getSafeSubstring(line, 0, 0);
    const middle = CH2.getSafeSubstring(line, 1, -2);
    const end = CH2.getSafeSubstring(line, -1);
    return start + CH2.insert_format({
      background: Colors.custom_colors(0, true)
    }, middle) + end;
  }).join("\n");
  final += "\n" + box.slice(-1);
  str = final;
  return { text: str, pos: { x: start_w, y: start_h } };
};
var MsgBoxHandler = class _MsgBoxHandler {
  static #instance = null;
  static getInstance() {
    if (!_MsgBoxHandler.#instance) {
      _MsgBoxHandler.#instance = new _MsgBoxHandler();
    }
    return _MsgBoxHandler.#instance;
  }
  constructor() {
    if (_MsgBoxHandler.#instance) {
      return _MsgBoxHandler.#instance;
    }
    _MsgBoxHandler.#instance = this;
    this.text = "";
    this.title = "";
    this.options = [];
    this.select = -1;
    this.open = false;
    this.onSelect = null;
  }
  /**
   * Handles user input for navigating and selecting options in a message box.
   *
   * @param {number} input - The input value representing the user's action:
   *   - `-1` to move the selection to the left.
   *   - `1` to move the selection to the right.
   *   - `0` to confirm the current selection.
   *
   * Updates the `select` property to reflect the current selection index.
   * Wraps around the selection index if it goes out of bounds.
   * If the input is `0` and a valid selection is made, it closes the message box
   * and invokes the `onSelect` callback with the selected index.
   */
  handleInput(input) {
    if (input === -1) {
      this.select--;
      if (this.select < 0) {
        this.select = this.options.length - 1;
      }
    } else if (input === 1) {
      this.select++;
      if (this.select >= this.options.length) {
        this.select = 0;
      }
    } else if (input === 0 && this.select >= 0) {
      this.open = false;
      if (typeof this.onSelect === "function") {
        this.onSelect(this.select);
        this.select = 0;
      }
    }
  }
  /**
   * Displays a message box with the specified text, title, and options.
   *
   * @param {string} text - The message to display in the message box.
   * @param {string} [title=""] - The title of the message box (optional).
   * @param {string[]} [options=[]] - An array of options for the user to select from. Defaults to ["OK"] if no options are provided.
   * @param {function(number):void} onSelect - A callback function that is invoked when the user selects an option. 
   *                                           The selected option's index is passed as an argument.
   */
  raise(text, title = "", options = [], onSelect) {
    this.text = text;
    this.title = title;
    this.select = 0;
    if (options.length == 0) {
      options = ["OK"];
    }
    this.options = options;
    this.onSelect = onSelect;
    this.open = true;
  }
  /**
   * Retrieves the text and position from the message box.
   *
   * @returns {{text: string, pos: {x:number, y:number}}} An object containing the selected text and its position.
   */
  getText() {
    const { text, pos } = msgbox(this.text, this.title, this.options, this.select);
    return { text, pos };
  }
};

// Simulator/Engine/Symbols.js
var useSafeTerminal = false;
var Arrows = {
  up: useSafeTerminal ? "^" : "\u2191",
  down: useSafeTerminal ? "v" : "\u2193",
  left: useSafeTerminal ? "<" : "\u2190",
  right: useSafeTerminal ? ">" : "\u2192",
  upDown: useSafeTerminal ? "*" : "\u2195",
  leftRight: useSafeTerminal ? "<>" : "\u2194",
  upLeft: useSafeTerminal ? "\\" : "\u2196",
  upRight: useSafeTerminal ? "/" : "\u2197",
  downLeft: useSafeTerminal ? "/" : "\u2199",
  downRight: useSafeTerminal ? "\\" : "\u2198"
};
var delta = useSafeTerminal ? "d" : "\u0394";
var enter = useSafeTerminal ? "enter" : "\u21B5";

// Simulator/Engine/SceneObject.js
var CH3 = new BasicConsole();
var SceneObject = class {
  constructor(pos, getValue) {
    if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number" || typeof pos.z !== "number") {
      throw new Error("pos must have numeric x, y, and z properties");
    }
    if (pos.x < -2 || pos.y < -2 || pos.z < 0) {
      throw new Error("pos x, y, and z must be greater than or equal to -2. -1: means at the end. -2: means at the start");
    }
    this.pos = pos;
    this.getValue = getValue;
  }
};

// Simulator/Engine/Scenes.js
var CH4 = new BasicConsole();
var Scene = class {
  #objects = [];
  // Array of objects in the scene
  //this should be sorted by z index (the lowest z index is drawn in the back)
  #finished = { value: false, navigate: null };
  // if true, the scene will be removed from the stack
  constructor() {
    this.changed = false;
    this.alignment = "center";
    this.kill = false;
  }
  get finished() {
    return this.#finished;
  }
  /**
   * Sets the finished state and the alias for the next scene.
   *
   * @param {boolean} value - Indicates whether the scene is finished.
   * @param {string} navigate - If set, the Engine will try to navigate to this alias if it detecs that the Scene has finished.value set to true.
   */
  setFinished = (value, navigate) => {
    this.#finished.value = value;
    this.#finished.navigate = navigate;
  };
  onEnter() {
  }
  onExit() {
  }
  handleInput(input) {
  }
  addObject(object) {
    if (!(object instanceof SceneObject)) {
      throw new Error("Object must be an instance of SceneObject");
    }
    this.#objects.push(object);
    this.#objects = this.#objects.sort((a, b) => a.pos.z - b.pos.z);
  }
  removeObject(object) {
    const index = this.#objects.indexOf(object);
    if (index > -1) {
      this.#objects.splice(index, 1);
    }
    this.#objects = this.#objects.sort((a, b) => a.pos.z - b.pos.z);
  }
  draw() {
    throw new Error("draw() method not implemented in Scene class. Please implement it in the derived class.");
    let text = "number of objects: " + this.#objects.length + "\n";
    for (let i = 0; i < this.#objects.length; i++) {
      const size = CH4.getSize(this.#objects[i].getValue());
      text += `[${i}: x: ${this.#objects[i].pos.x} +${size.width} y: ${this.#objects[i].pos.y} +${size.height} z: ${this.#objects[i].pos.z}],`;
    }
    console.log(text);
    text = "";
    for (let i = 0; i < this.#objects.length; i++) {
      console.log("object: ", this.#objects[i].pos);
      const object = this.#objects[i];
      const pos = object.pos;
      let value = object.getValue();
      const size = CH4.getSize(value);
      value = value.split("\n");
      const text_size = CH4.getSize(text);
      for (let j = 0; j < pos.y + size.height + 1 - text_size.height; j++) {
        text += "\n";
      }
      console.log("size: ", size, "text_size: ", text_size, CH4.getSize(text));
      text = text.split("\n").map((line, index) => {
        if (index >= pos.y && index < pos.y + size.height - 1) {
          const new_obj_index = index - pos.y;
          const length = CH4.getLineWidth(value[new_obj_index]);
          const line_len = CH4.getLineWidth(line);
          if (line_len < pos.x) {
            line = " ".repeat(pos.x - line_len) + line;
          }
          const line_len2 = CH4.getLineWidth(line);
          const after = line_len > pos.x + length ? CH4.getSafeSubstring(line, line_len2 - (pos.x + length)) : "";
          console.log(pos.x, length, line_len, line_len2, line_len2 - (pos.x + length), line_len > pos.x + length, CH4.getLineWidth(after));
          return line = CH4.getSafeSubstring(line, 0, pos.x - 1) + value[new_obj_index] + after;
        } else {
          return line;
        }
      }).join("\n");
    }
    return text + "\n" + "-".repeat(CH4.getWidth()) + "\n";
  }
};

// Simulator/Engine/Engine.js
var CH5 = new BasicConsole();
var performaceCheck = class {
  constructor() {
    this.times = {};
    this.lastDelta = 0;
    this.history = [];
    this.historySize = 10;
    this.historyIndex = 0;
  }
  addTime(time) {
    this.history[this.historyIndex] = time;
    this.historyIndex++;
    if (this.historyIndex >= this.historySize) {
      this.historyIndex = 0;
    }
  }
  fps() {
    let oldIndex = this.historyIndex - 1;
    if (oldIndex < 0) {
      oldIndex = this.historySize - 1;
    }
    const delta2 = this.history[this.historyIndex] - this.history[oldIndex];
    const fps = Math.round(1e3 / (delta2 === 0 ? 1 : delta2));
    const avg = this.history.reduce((a, b) => a + b, 0) / this.history.length;
    const min = Math.min(...this.history);
    const max = Math.max(...this.history);
    return `FPS: ${(1e3 / avg).toFixed(1)} AVG: ${avg.toFixed(1)} | MIN: ${min} | MAX: ${max} |`;
  }
};
var ConsoleEngine = class _ConsoleEngine {
  static #instance = null;
  // Singleton instance of the ConsoleEngine Should not have 2 instances
  #timer = null;
  // Timer for the rendering loop
  #tagetFPS = 30;
  // Target frames per second for the engine
  /*The camera position starts at the top left corner of the frame.
   *Then it is offset by the camera position. 
  */
  #camera_pos = { x: 0, y: 0 };
  // Camera position in the console
  #minSize = { w: -1, h: -1 };
  // Minimum size for the console
  #lastInput = null;
  // Last input received by the engine
  #Version = "1.0";
  get Version() {
    return this.#Version;
  }
  constructor() {
    if (_ConsoleEngine.#instance) {
      return _ConsoleEngine.#instance;
    }
    _ConsoleEngine.#instance = this;
    this.performaceCheck = new performaceCheck();
    this.msgBox = new MsgBoxHandler();
    this.scenes = [];
    this.sceneHistory = [];
    this.locked = false;
    this.debug = false;
    this.lastFrame = Date.now();
    this.onExit = null;
    this.resize();
    this.#start();
  }
  /**
   * Starts the engine's rendering loop with a specified frame rate.
   * If a timer is already running, it clears the existing interval before starting a new one.
   * The frame rate is determined by the `#tagetFPS` property, defaulting to 30 FPS if not set or invalid.
   * The interval duration is slightly adjusted to account for overhead.
   * 
   * @private
   */
  #start() {
    if (this.#timer) {
      clearInterval(this.#timer);
    }
    const fps = this.#tagetFPS > 0 ? this.#tagetFPS : 30;
    const ms = Math.round(1e3 / (fps * 1.1));
    this.#timer = setInterval(() => {
      this.draw();
    }, ms);
  }
  /**
   * Sets the minimum size for the engine and triggers a resize operation.
   * A value of 0 for width or height will not change the respective dimension.
   * A negative value will mean no minimum size restriction.
   * @param {number} w - The minimum width to set.
   * @param {number} h - The minimum height to set.
   */
  setMinSize(w, h) {
    if (w !== void 0 && w != 0) {
      this.#minSize.w = w;
    }
    if (h !== void 0 && h != 0) {
      this.#minSize.h = h;
    }
    this.resize();
  }
  /**
   * Sets the target frames per second (FPS) for the engine and (re)starts the engine loop.
   * 
   * @param {number} fps - The desired frames per second. Must be greater than 0.
   */
  targetFPS(fps) {
    if (fps > 0) {
      this.#tagetFPS = fps;
      this.#start();
    }
  }
  /**
   * Adds a new scene to the engine and optionally assigns it an alias.
   * If the scene history is empty, it automatically navigates to the added scene.
   *
   * @param {Scene} scene - The scene to be added. Must be an instance of the `Scene` class.
   * @param {string} [alias] - An optional alias for the scene. Defaults to the scene's constructor name.
   * It is not allowed to be "Exit".
   * @throws {Error} Throws an error if the provided scene is not an instance of `Scene`.
   */
  addScene(scene, alias) {
    if (!(scene instanceof Scene)) {
      throw new Error("Scene must be an instance of Scene");
    }
    if (alias === "Exit") {
      throw new Error("Scene must not be named Exit, this is reserved.");
    }
    if (scene) {
      this.scenes.push({ scene, alias: alias || scene.constructor.name });
      if (this.sceneHistory.length <= 0)
        this.goToScene(alias || scene.constructor.name);
    }
  }
  /**
   * Navigates to a specified scene by its alias or navigates back to the previous scene.
   *
   * @param {string|number} alias - The alias of the scene to navigate to, or -1/"back" to go to the previous scene.
   * @returns {boolean} - Returns `true` if the navigation was successful, otherwise `false`.
   */
  goToScene(alias, whoiam) {
    if (alias == "Exit" && this.onExit) {
      this.msgBox.raise(
        "Are you sure you want to exit?",
        "Exit",
        ["Yes", "No"],
        (res) => {
          if (res == 0) {
            this.onExit();
          }
        }
      );
      return true;
    }
    if (alias === -1 || alias === "back") {
      if (this.sceneHistory.length > 1) {
        this.sceneHistory[0]?.scene.onExit();
        this.sceneHistory.shift();
        this.sceneHistory[0].scene.onEnter();
      }
      return true;
    }
    const scene = this.scenes.find((s) => s.alias === alias);
    if (scene) {
      this.sceneHistory[0]?.scene.onExit();
      if (this.sceneHistory.length > 1 && this.sceneHistory[1].alias == scene.alias) {
        this.sceneHistory.splice(1, 1);
      }
      this.sceneHistory.unshift({ ...scene, added: whoiam });
      scene.scene.onEnter();
      return true;
    }
    return false;
  }
  /**
   * Sets the position of the camera.
   * Ensures that the camera position does not go below 0 for both x and y coordinates.
   *  
   * The camera position is the offset from the top left corner of the frame. 
   * 
   * @param {number} [x] - The x-coordinate of the camera position. If undefined, the x-coordinate remains unchanged.
   * @param {number} [y] - The y-coordinate of the camera position. If undefined, the y-coordinate remains unchanged.
   */
  setCameraPos(x, y) {
    if (x !== void 0) {
      if (x < 0) {
        x = 0;
      }
      this.#camera_pos.x = x;
    }
    if (y !== void 0) {
      if (y < 0) {
        y = 0;
      }
      this.#camera_pos.y = y;
    }
  }
  /**
   * Moves the camera by the specified x and y offsets.
   * This triggers a redraw of the console to reflect the new camera position.
   * The camera position is the offset from the top left corner of the frame. 
   * @param {number} x - The horizontal offset to move the camera.
   * @param {number} y - The vertical offset to move the camera.
   */
  moveCamera(x, y) {
    this.setCameraPos(this.#camera_pos.x + x, this.#camera_pos.y + y);
    this.draw();
  }
  /**
   * Retrieves the current scene from the list of scenes.
   * If there are no scenes available, it returns null.
   *
   * @returns {Object|null} The current scene object if available, otherwise null.
   */
  currentScene() {
    if (this.sceneHistory.length > 0) {
      return this.sceneHistory[0].scene;
    }
    return null;
  }
  /**
   * Resizes the console and adjusts the engine's state accordingly.
   * 
   * - Checks the new console dimensions and compares them against the minimum size.
   * - If the new size is smaller than the minimum, displays a warning message and locks the engine.
   * - If the size is valid, unlocks the engine and triggers a redraw.
   * 
   * @private
   * @method resize
   * @throws {Error} If the console dimensions are invalid or cannot be retrieved.
   */
  resize() {
    const newWidth = CH5.getWidth();
    const newHeight = CH5.getHeight();
    if (this.#minSize.w > 0 && newWidth < this.#minSize.w || this.#minSize.h > 0 && newHeight < this.#minSize.h) {
      CH5.clear_screen();
      let minSizeWarning = "Warning:\n";
      minSizeWarning += `Minimum size is ${this.#minSize.w}x${this.#minSize.h}, current size is ${newWidth}x${newHeight}`;
      minSizeWarning += "\nResize the console to continue.";
      const wColor = this.#minSize.w > 0 && newWidth < this.#minSize.w ? DefaultColors.RED : DefaultColors.WHITE;
      const hColor = this.#minSize.h > 0 && newHeight < this.#minSize.h ? DefaultColors.RED : DefaultColors.WHITE;
      minSizeWarning = CH5.matchAndReplace(
        minSizeWarning,
        [
          { text: `${newWidth}`, format: { color: wColor, decoration: Decorations.Bold } },
          { text: `${newHeight}`, format: { color: hColor, decoration: Decorations.Bold } },
          { text: `${this.#minSize.h}`, format: { color: DefaultColors.YELLOW, decoration: Decorations.Bold } },
          { text: `${this.#minSize.w}`, format: { color: DefaultColors.YELLOW, decoration: Decorations.Bold } },
          { text: `Warning:`, format: { color: DefaultColors.YELLOW, decoration: Decorations.Bold } }
        ]
      );
      CH5.hprint(minSizeWarning);
      this.locked = true;
      return false;
    }
    this.locked = false;
    this.draw();
    return true;
  }
  handleInput(input, modifiers) {
    if (this.debug) {
      this.#lastInput = `${input} [s:${modifiers.shift ? 1 : 0}, c: ${modifiers.ctrl ? 1 : 0}, a:${modifiers.alt ? 1 : 0}]`;
    }
    if (input == "d" && modifiers.ctrl) {
      this.toggleDebug();
    }
    if (this.locked) {
      return;
    }
    if (this.msgBox.open) {
      if (input == "enter" || input == "space") {
        this.msgBox.handleInput(0);
      } else if (input == "arrowleft") {
        this.msgBox.handleInput(-1);
      } else if (input == "arrowright") {
        this.msgBox.handleInput(1);
      }
    } else {
      const res = this.currentScene()?.handleInput(input, modifiers);
      if (typeof res == "string" || res == -1) {
        const went = this.goToScene(res);
        if (went) {
          this.draw();
        }
      }
    }
  }
  toggleDebug() {
    this.debug = !this.debug;
    this.draw(true);
  }
  /**
   * Draws the current scene or displays debug information and messages.
   * This method handles rendering the current scene, managing the camera system,
   * and optionally displaying debug information.
   *
   * @method
   * @param {boolean} [force=false] - If true, forces the screen to redraw even if locked.
   * @memberof Engine
   * @returns {void}
   */
  draw(force = false) {
    if (this.currentScene()?.finished.value) {
      if (this.currentScene().finished.navigate) {
        if (this.goToScene(this.currentScene().finished?.navigate)) {
          this.draw(true);
        }
        return;
      }
    }
    if (this.locked && !force) {
      return;
    }
    if (this.scenes.length == 0) {
      CH5.clear_screen();
      CH5.write("No scenes to draw.");
      return;
    }
    let text = this.currentScene()?.draw() || "";
    const size = CH5.getSize(text);
    CH5.home_cursor();
    if (this.debug) {
      this.performaceCheck.addTime(Date.now() - this.lastFrame);
      let debugText = "Debug: " + this.scenes.length + " scenes loaded [" + this.sceneHistory[0].alias + "]";
      debugText += ` w:${size.width}, h:${size.height} d:${CH5.getHeight() - this.debug * 4 - size.height}
`;
      debugText += "Console: " + CH5.getWidth() + "x" + CH5.getHeight() + " " + delta + `t: ${Date.now() - this.lastFrame} camera: ` + this.#camera_pos.x + "," + this.#camera_pos.y + " " + this.#lastInput + "\n";
      const ms = Math.round(1e3 / this.#tagetFPS);
      debugText += `Target: ${this.#tagetFPS}, MS: ${ms} ` + this.performaceCheck.fps() + "\n";
      CH5.write(CH5.hcenter(debugText, CH5.getWidth(), " ", "left"));
    } else {
    }
    const getPos = (size2, camera) => {
      let start_x = camera.x;
      let start_y = camera.y;
      if (size2.width <= CH5.getWidth()) {
        start_x = 0;
      } else if (start_x + CH5.getWidth() - 1 > size2.width) {
        start_x = size2.width - CH5.getWidth() + 1;
      }
      if (size2.height <= CH5.getHeight()) {
        start_y = 0;
      } else if (start_y + CH5.getHeight() - 1 > size2.height) {
        start_y = size2.height - CH5.getHeight() + 1;
      }
      return { start_x, start_y };
    };
    this.currentScene().changed = false;
    if (text) {
      if (text[text.length - 1] === "\n") {
        text = text.slice(0, -1);
      }
      const pos = getPos(size, this.#camera_pos);
      text = text.split("\n").map((line) => {
        const oldSize = CH5.getLineWidth(line);
        if (oldSize <= pos.start_x)
          return CH5.hcenter("");
        line = CH5.getSafeSubstring(line, pos.start_x, pos.start_x + CH5.getWidth() - 1);
        return line = CH5.hcenter(line, CH5.getWidth(), " ", "left");
      }).slice(pos.start_y, pos.start_y + CH5.getHeight() - this.debug * 5).join("\n");
      const adjusted_size = CH5.getSize(text);
      const delta2 = CH5.getHeight() - this.debug * 5 - adjusted_size.height;
      for (let i = 0; i < delta2; i++) {
        text += "\n" + " ".repeat(CH5.getWidth());
      }
      if (this.msgBox.open) {
        const msgBox = this.msgBox.getText();
        const msgBoxLines = msgBox.text.split("\n");
        const msgBoxLength = CH5.getSize(msgBox.text);
        text = text.split("\n").map((line, index) => {
          if (index >= msgBox.pos.y && index < msgBox.pos.y + msgBoxLength.height) {
            msgBoxLines[index - msgBox.pos.y].length;
            line = CH5.getSafeSubstring(line, 0, msgBox.pos.x - 1) + msgBoxLines[index - msgBox.pos.y] + CH5.getSafeSubstring(line, msgBox.pos.x + msgBoxLength.width, CH5.getWidth());
          }
          return line;
        }).join("\n");
      }
      CH5.write(text);
    }
    this.lastFrame = Date.now();
  }
};

// Simulator/Engine/Assets/Assets.js
var CH6 = new BasicConsole();
var Colors2 = DefaultColors;
var Logos = class _Logos {
  static get MattediWorks() {
    return `
 __  __         _    _             _  _ __          __           _         
|  \\/  |       | |  | |           | |(_)\\ \\        / /          | |        
| \\  / |  __ _ | |_ | |_  ___   __| | _  \\ \\  /\\  / /___   _ __ | | __ ___ 
| |\\/| | / _\` || __|| __|/ _ \\ / _\` || |  \\ \\/  \\/ // _ \\ | '__|| |/ // __|
| |  | || (_| || |_ | |_|  __/| (_| || |   \\  /\\  /| (_) || |   |   < \\__ \\
|_|  |_| \\__,_| \\__| \\__|\\___| \\__,_||_|    \\/  \\/  \\___/ |_|   |_|\\_\\|___/
`;
  }
  static get Mattedi() {
    return ` __  __         _    _             _  _ 
|  \\/  |       | |  | |           | |(_)
| \\  / |  __ _ | |_ | |_  ___   __| | _ 
| |\\/| | / _\` || __|| __|/ _ \\ / _\` || |
| |  | || (_| || |_ | |_|  __/| (_| || |
|_|  |_| \\__,_| \\__| \\__|\\___| \\__,_||_|`;
  }
  static get Works() {
    return `__          __           _         
\\ \\        / /          | |        
 \\ \\  /\\  / /___   _ __ | | __ ___ 
  \\ \\/  \\/ // _ \\ | '__|| |/ // __|
   \\  /\\  /| (_) || |   |   < \\__ \\
    \\/  \\/  \\___/ |_|   |_|\\_\\|___/`;
  }
  static get ConsoleAdventure() {
    return `
    ___                      _          _       _                 _                  
   / __\\___  _ __  ___  ___ | | ___    /_\\   __| |_   _____ _ __ | |_ _   _ _ __ ___ 
  / /  / _ \\| '_ \\/ __|/ _ \\| |/ _ \\  //_\\\\ / _\` \\ \\ / / _ | '_ \\| __| | | | '__/ _ \\
 / /__| (_) | | | \\__ | (_) | |  __/ /  _  | (_| |\\ V |  __| | | | |_| |_| | | |  __/
/____/ \\___/|_| |_|___/\\___/|_|\\___| \\_/ \\_/\\__,_| \\_/ \\___|_| |_|\\__|\\__,_|_|  \\___|
                                                                                  
`;
  }
  static get ca_cutoff() {
    return 36;
  }
  static get mw_cutoff() {
    return 39;
  }
  static animatedSynced = (logo, ms, color = { color: Colors2.RED, index: 1, bgcolor: Colors2.YELLOW }, center = true) => {
    CH6.show_cursor(false);
    let textArray = logo.split("\n");
    if (center) {
      const old_len = Math.max(...textArray.map((item) => item.length));
      for (let i = 0; i < textArray.length; i++) {
        textArray[i] = CH6.hcenter(textArray[i], CH6.getWidth());
      }
      const w_diff = textArray[1].length - old_len;
      color.index = Math.round(w_diff / 2) + color.index;
    }
    const hval = Math.max(...textArray.map((item) => item.length));
    const width = CH6.getWidth();
    const get_partial = (sprite, index) => {
      let res = "";
      sprite.forEach((element) => {
        let line = element.substring(0, index);
        if (color) {
          line = CH6.insert_color(color.bgcolor, line.substring(0, color.index)) + CH6.insert_color(color.color, line.substring(color.index));
        }
        res += CH6.hcenter(line, width);
        res += "\n";
      });
      return res;
    };
    for (let i = 0; i < hval; i++) {
      let start = Date.now();
      CH6.clear_screen();
      CH6.print(get_partial(textArray, i + 1));
      while (Date.now() - start < ms) {
      }
    }
  };
  static animate = (logo, ms, color = { color: Colors2.RED, index: 1, bgcolor: Colors2.YELLOW }, center = true, callback) => {
    CH6.show_cursor(false);
    let textArray = logo.split("\n");
    if (center) {
      const old_len = Math.max(...textArray.map((item) => item.length));
      for (let i = 0; i < textArray.length; i++) {
        textArray[i] = CH6.hcenter(textArray[i], CH6.getWidth());
      }
      const w_diff = textArray[1].length - old_len;
      if (color)
        color.index = Math.round(w_diff / 2) + color.index;
    }
    const hval = Math.max(...textArray.map((item) => item.length));
    const width = CH6.getWidth();
    const get_partial = (sprite, index) => {
      let res = "";
      sprite.forEach((element) => {
        let line = element.substring(0, index);
        if (color) {
          line = CH6.insert_color(color.bgcolor, line.substring(0, color.index)) + CH6.insert_color(color.color, line.substring(color.index));
        }
        res += CH6.hcenter(line, width);
        res += "\n";
      });
      return res;
    };
    const render = (index) => {
      CH6.clear_screen();
      CH6.print(get_partial(textArray, index + 1));
      if (index < hval) {
        setTimeout(() => {
          render(index + 1);
        }, ms);
      } else {
        if (callback) {
          callback();
        }
      }
    };
    setTimeout(() => {
      render(1);
    }, ms);
  };
  static paintedConsoleAdventure = (center = true) => {
    let logo_sprite = _Logos.ConsoleAdventure.split("\n");
    const max_len = Math.max(...logo_sprite.map((item) => item.length));
    logo_sprite = logo_sprite.map((item) => item.padEnd(max_len, " "));
    const old_len = logo_sprite[1].length;
    let cut_off = _Logos.ca_cutoff;
    if (center) {
      for (let i = 0; i < logo_sprite.length; i++) {
        logo_sprite[i] = CH6.hcenter(logo_sprite[i], CH6.getWidth());
      }
      cut_off = Math.round((logo_sprite[1].length - old_len) / 2) + cut_off;
    }
    return logo_sprite.map((item) => CH6.insert_color(Colors2.YELLOW, item.substring(0, cut_off)) + CH6.insert_color(Colors2.GREEN, item.substring(cut_off))).join("\n");
  };
  static paintedMattediWorks = (center = true, colors = { color1: 39, color2: 208 }) => {
    let logo_sprite = _Logos.MattediWorks.split("\n");
    const max_len = Math.max(...logo_sprite.map((item) => item.length));
    logo_sprite = logo_sprite.map((item) => item.padEnd(max_len, " "));
    const old_len = logo_sprite[1].length;
    let cut_off = _Logos.mw_cutoff + 1;
    if (center) {
      for (let i = 0; i < logo_sprite.length; i++) {
        logo_sprite[i] = CH6.hcenter(logo_sprite[i], CH6.getWidth());
      }
      cut_off = Math.floor((logo_sprite[1].length - old_len) / 2) + cut_off;
    }
    return logo_sprite.map((item) => CH6.insert_color(Colors2.custom_colors(colors.color1), item.substring(0, cut_off)) + CH6.insert_color(Colors2.custom_colors(colors.color2), item.substring(cut_off))).join("\n");
  };
};
var GenieSprite = class _GenieSprite {
  static #image_1 = `\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u28C0\u28C0\u28E0\u28C4\u28C0\u28C0\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u28F0\u28FF\u28FF\u28FF\u287F\u28BF\u28FF\u28FF\u28FF\u28C6\u2800\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2839\u283F\u281B\u28C1\u28E4\u28E4\u28C8\u281B\u283F\u280F\u2800\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u28B8\u28FF\u28FF\u28FF\u28FF\u2847\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u28C0\u28E4\u28F4\u28F6\u28E4\u28C8\u2819\u283B\u281F\u280B\u28C1\u28E4\u28F6\u28E6\u28E4\u28C0\u2800\u2800\u2800\u2800
\u2800\u28E4\u28FE\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28F6\u28F6\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28F7\u28E4\u2800
\u28FE\u28FF\u28FF\u28FF\u28FF\u28FF\u28E7\u28C0\u28C0\u28C0\u28C0\u28C0\u2840\u2800\u2880\u28C0\u28E0\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28F7
\u2819\u283F\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u283F\u283F\u280B\u2801\u2800\u2836\u28BF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u283F\u283F\u280B
\u2800\u2800\u2800\u2800\u2800\u28C0\u28C0\u28E4\u28E4\u28F6\u28FE\u28FF\u28F7\u28F6\u28E4\u28E4\u28C0\u28C0\u28C0\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u28BF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u287F\u2801\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2818\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u287F\u2801\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2818\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u2801\u2800\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2808\u28BF\u28FF\u28FF\u28FF\u283F\u281F\u281B\u2889\u28C4\u2800\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2820\u28A4\u28E4\u28F6\u28FE\u28FF\u28FF\u28FF\u28F6\u28F6\u28F6\u2836\u2812\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2808\u2809\u2809\u2819\u281B\u2809\u2809\u2809\u2800\u2800\u2800\u2800`;
  static #image_2 = `
\u2800\u2800\u2800\u2800\u2800\u2880\u28F4\u28FE\u28FF\u28FF\u28FF\u28FF\u28F7\u28E6\u2840\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u28B8\u28FF\u281F\u280B\u28C9\u28C9\u2819\u283B\u28FF\u2847\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2809\u28A0\u28FE\u28FF\u28FF\u28F7\u2844\u2809\u2800\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u28C0\u28E4\u2844\u2818\u28FF\u28FF\u28FF\u28FF\u2803\u28A0\u28E4\u28C4\u2840\u2800\u2800\u2800
\u2800\u2880\u28F4\u28FF\u28FF\u28FF\u28FF\u28E6\u28C8\u2809\u2809\u28C1\u28F4\u28FF\u28FF\u28FF\u28FF\u28F7\u28C4\u2800
\u2800\u28FE\u28FF\u28FF\u28FF\u287F\u281B\u281B\u281B\u281B\u281B\u281B\u281B\u281B\u28BF\u28FF\u28FF\u28FF\u28FF\u28E7
\u28B8\u28FF\u28FF\u28FF\u28FF\u28F7\u28E4\u28E4\u28E4\u2844\u28A0\u28E4\u28E4\u28E4\u28FE\u28FF\u28FF\u28FF\u28FF\u28FF
\u2800\u28BB\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u287F\u2801\u2800\u28BB\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u280F
\u2800\u2800\u2819\u283B\u283F\u283F\u281F\u281B\u2881\u28FC\u28F7\u28C4\u2819\u281B\u283F\u283F\u283F\u281F\u2801\u2800
\u2800\u2800\u2800\u2800\u2820\u28E4\u28F6\u28FE\u28FF\u28FF\u28FF\u28FF\u28FF\u28F6\u28F6\u2800\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u283B\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u2840\u2800\u2800\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2819\u283F\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28FF\u28C4\u2840\u2800\u2800
\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2800\u2809\u281B\u283B\u283F\u28BF\u28FF\u28FF\u28FF\u28FF\u28F7\u2804`;
  static getSprite(value) {
    if (typeof value === `boolean`)
      return value ? _GenieSprite.#image_1 : _GenieSprite.#image_2;
    const genie_seed = Math.random() > 0.5;
    if (genie_seed) {
      return _GenieSprite.#image_1;
    } else
      return CH6.vcenter(_GenieSprite.#image_2.split("\n"), _GenieSprite.#image_1.split("\n").length, Math.max(..._GenieSprite.#image_1.split("\n").map((line) => line.length))).join("\n");
  }
};
var Assets_default = {
  Logos,
  GenieSprite
};

// Simulator/Scenes/Alias.js
var SceneAlias = {
  wecome: "Welcome",
  taskManager: "taskManager",
  openingAnimation: "openingAnimation",
  mainMenu: "MainMenu",
  simulationScreen: "simulationScreen",
  systemMenu: "systemMenu"
};
var Alias_default = SceneAlias;

// Simulator/Scenes/WelcomeScreen.js
var import_readline_sync = __toESM(require_readline_sync(), 1);
var Colors3 = DefaultColors;
var CH7 = new BasicConsole();
var sprites = {
  normal: [" \n/", "_\n ", "_\n ", "_\n ", " \n\\", " \n_", " \n_", " \n_"],
  back: [" \n/", " \n_", " \n_", " \n_", " \n\\", "_\n ", "_\n ", "_\n "]
};
var welcomeScreen = class extends Scene {
  constructor(animation_ms = 100) {
    super();
    this.timer = null;
    this.animation_ms = animation_ms;
    this.animIndex = 0;
  }
  onEnter() {
    if (this.animation_ms <= 0 || this.timer) {
    }
    ;
    this.timer = setInterval(() => {
      this.animIndex++;
      if (this.animIndex > CH7.getWidth() * 2) {
        this.animIndex = 0;
      }
    }, this.animation_ms);
  }
  onExit() {
    clearInterval(this.timer);
    this.timer = null;
  }
  draw() {
    const perfectpaintedMw = CH7.getWidth() > 75 ? CH7.merge(
      CH7.paint(Assets_default.Logos.Mattedi, Colors3.custom_colors(39)),
      CH7.paint(Assets_default.Logos.Works, Colors3.custom_colors(208)),
      { padding: 0 }
    ) : CH7.paint(Assets_default.Logos.Mattedi, Colors3.custom_colors(39)) + "\n" + CH7.paint(Assets_default.Logos.Works, Colors3.custom_colors(208));
    let text = CH7.hcenter(perfectpaintedMw);
    text += "\n";
    const title = CH7.getWidth() > 93 ? "Scheduler Simulator" : "Scheduler\nSimulator";
    let titleText = "";
    for (let i = 0; i < title.length; i++) {
      if (title[i] == "\n") {
        text += CH7.hcenter(titleText) + "\n";
        titleText = "";
        continue;
      }
      const maxSeed = 9;
      let seed = maxSeed - Math.floor(Date.now() / 100) % (maxSeed + 1);
      let dist2 = i >= 9 ? i - 9 : 9 - i;
      dist2 = (dist2 + seed) % (maxSeed + 1);
      titleText = CH7.merge(
        titleText,
        CH7.paint(getFiGlet(title[i]), Colors3.custom_colors(245 + dist2)),
        {
          padding: 0,
          align: "bottom"
        }
      );
    }
    text += CH7.hcenter(titleText);
    text += "\n\n\n";
    text += CH7.matchAndReplace(
      "Press Space to start.",
      [{ text: "Space", format: { color: Colors3.custom_colors(39), decoration: Decorations.Bold } }]
    );
    text = CH7.hcenter(text);
    if (this.timer == null) {
      return text;
    }
    text += "\n".repeat(8);
    const colors = [
      Colors3.custom_colors(7),
      Colors3.custom_colors(255),
      Colors3.custom_colors(244),
      Colors3.custom_colors(238)
    ];
    let spr = "";
    for (let i = 0; i < 4; i++) {
      let index = this.animIndex - i;
      let back = false;
      if (index > CH7.getWidth()) {
        index = index - CH7.getWidth();
        back = true;
      }
      if (index < 0) {
        index = CH7.getWidth() + index;
        back = true;
      }
      let char = sprites[back ? "back" : "normal"][index % 8];
      if (i === 0) {
        char = char.replace("/", back ? Arrows.downLeft : Arrows.upRight);
        char = char.replace("\\", back ? Arrows.upLeft : Arrows.downRight);
        char = char.replace("_", back ? Arrows.left : Arrows.right);
      }
      char = char.replace("_", "-");
      spr = back ? CH7.merge(
        spr,
        CH7.paint(char, colors[i]),
        { padding: 0, align: "bottom" }
      ) : CH7.merge(
        CH7.paint(char, colors[i]),
        spr,
        { padding: 0, align: "bottom" }
      );
    }
    let dist = this.animIndex > CH7.getWidth() ? CH7.getWidth() * 2 - this.animIndex : this.animIndex;
    dist = dist >= 4 ? dist - 4 : 0;
    const sep = " ".repeat(dist) + "\n" + " ".repeat(dist);
    spr = CH7.merge(
      sep,
      spr,
      { padding: 0 }
    );
    let t2 = "";
    for (let i = 0; i < CH7.getWidth(); i++) {
      t2 += " ";
    }
    text += "\n" + CH7.hcenter(spr, CH7.getWidth(), " ", 1) + "\n";
    return text;
  }
  handleInput(input) {
    if (input == "enter" || input == "space") {
      return Alias_default.mainMenu;
    }
  }
};

// Simulator/Scheduler/FramesHelper.js
var CH8 = new BasicConsole();
var Colors4 = DefaultColors;
var genTaskTable = (taskArray, slots3, maxRows, select = { row: -1, col: -1 }, title = "") => {
  const selIndex = select.row;
  const attrIndex = select.col;
  const rowLength = slots3.reduce((acc, slot) => acc + slot.width, 0) + slots3.length + 1;
  let str = "";
  if (title !== "") {
    let fmt = {
      decoration: [
        Decorations.Bold,
        Decorations.Underlined
      ]
    };
    if (selIndex === -1) {
      title = " " + Arrows.left + " " + title + " " + Arrows.right + " ";
      fmt.background = Colors4.BG_WHITE;
      fmt.color = Colors4.custom_colors(17);
    }
    str += CH8.hcenter(CH8.insert_format(fmt, title), rowLength) + "\n";
  }
  str += "+";
  for (let i = 0; i < slots3.length; i++) {
    str += CH8.hcenter(slots3[i].name, slots3[i].width, "-") + "+";
  }
  str += "\n";
  const getIndexRange = (index, length, maxRows2) => {
    const half = Math.floor(maxRows2 / 2);
    const odd = maxRows2 % 2 == 0 ? 0 : 1;
    if (length <= maxRows2) {
      return { start: 0, end: length, _case: 1 };
    }
    if (index - half <= 0) {
      return { start: 0, end: maxRows2 - 1, _case: 2 };
    }
    if (length - index - odd < half) {
      return { start: length - (maxRows2 - 1), end: length, _case: 3 };
    }
    const start2 = index - half + 1;
    const end2 = index + half - 1 + odd;
    return { start: start2 === 1 ? 0 : start2, end: end2 === length - 1 ? length : end2, _case: 4 };
  };
  const { start, end, _case } = getIndexRange(selIndex, taskArray?.length | 0, maxRows);
  if (start > 0) {
    str += "+" + CH8.hcenter(Arrows.up + " +" + start + /*" total: " + taskArray.length + */
    " " + Arrows.up, rowLength - 2) + "+\n";
  }
  for (let i = start; i < end; i++) {
    let line = "";
    for (let j = 0; j < slots3.length; j++) {
      let val = slots3[j].getValue(taskArray[i], i);
      if (j == attrIndex && selIndex == i) {
        val = CH8.hcenter(val, slots3[j].width - 1) + Arrows.upDown;
        val = CH8.insert_format({
          color: Colors4.WHITE,
          background: Colors4.custom_colors(237, true),
          decoration: [Decorations.Bold]
        }, val);
      }
      line += CH8.hcenter(val, slots3[j].width);
      if (j < slots3.length - 1) {
        line += "|";
      }
    }
    if (i === selIndex) {
      line = CH8.insert_format({
        color: Colors4.custom_colors(17),
        background: Colors4.BG_WHITE,
        decoration: [Decorations.Bold]
      }, line);
    }
    str += "|" + line + "|\n";
  }
  if (end < taskArray.length)
    str += "+" + CH8.hcenter(Arrows.down + " +" + (taskArray.length - end) + /*" total: " + taskArray.length + */
    " " + Arrows.down, rowLength - 2) + "+\n";
  let bottomstr = "+";
  for (let i = 0; i < slots3.length; i++) {
    bottomstr += CH8.hcenter("", slots3[i].width, "-") + "+";
  }
  str += bottomstr + "\n";
  return str;
};
var genProcessorGraph = (history, currentIndex, reservedWidth = 0) => {
  let cores = delta + "t:\n";
  for (let i = 0; i < history[currentIndex].numProcessors; i++) {
    cores += "Core " + i + ":\n";
  }
  const cores_len = cores.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
  const availableWidth = CH8.getWidth() - reservedWidth - cores_len - 2;
  cores = CH8.hcenter(cores, cores_len, " ", 2);
  const len_per_t = 3;
  const num_of_t = Math.floor(availableWidth / (len_per_t + 1));
  let res = "";
  let lastT = -1;
  for (let i = 0; i < num_of_t; i++) {
    const index = currentIndex - i;
    if (index >= 0 && history[index].t >= 0) {
      lastT = Math.max(history[index].t, lastT);
      let currentSlice = CH8.hcenter("" + history[index].t, len_per_t);
      if (history[index].t > 999) {
        currentSlice = currentSlice[0] + "." + currentSlice[currentSlice.length - 1];
      }
      if (history[index].t == history[history.length - 1].t) {
        currentSlice = CH8.insert_color(Colors4.GREEN, currentSlice);
      } else if (history[index].t == history[currentIndex].t) {
        currentSlice = CH8.insert_color(Colors4.YELLOW, currentSlice);
      }
      currentSlice += "|\n";
      for (let j = 0; j < history[index].numProcessors; j++) {
        currentSlice += history[index].currentTasks[j] ? Task.getLine(history[index].currentTasks[j], len_per_t + 1) : CH8.insert_color(Colors4.LIGHTBLACK_EX, "----");
        currentSlice += "\n";
      }
      res = CH8.merge(currentSlice, res, { padding: 0 });
    } else {
      lastT++;
      let currentSlice = CH8.hcenter("" + lastT, len_per_t);
      if (lastT > 999) {
        currentSlice = currentSlice[0] + "." + currentSlice[currentSlice.length - 1];
      }
      currentSlice += "|\n";
      for (let j = 0; j < history[currentIndex].numProcessors; j++) {
        currentSlice += "    ";
        currentSlice += "\n";
      }
      res = CH8.merge(res, currentSlice, { padding: 0 });
    }
  }
  return CH8.merge(cores, res, { padding: 0, align: "top" });
};
var genProcessorsFrame = (history, currentIndex) => {
  const table_slots = [
    { name: "Processor-(#N)", width: 16, getValue: (task, i) => "Core #" + i },
    {
      name: "TASK",
      width: 8,
      getValue: (task) => {
        let txt = task ? "ID: " + CH8.insert_color(task.format.color, "" + task.id) : CH8.insert_color(Colors4.LIGHTBLACK_EX, "IDLE");
        return CH8.hcenter(txt, 8, " ", task ? 1 : 0);
      }
    }
  ];
  const table = genTaskTable(history[currentIndex].currentTasks, table_slots, history[currentIndex].currentTasks?.length | history[currentIndex].numProcessors);
  const table_len = CH8.getSize(table).width;
  const cores = genProcessorGraph(history, currentIndex, table_len + 2);
  return CH8.merge(table, cores, { padding: 2 });
};
var selectedFormat = {
  color: Colors4.custom_colors(39),
  decoration: Decorations.Bold
};
var formatText = (text, selected, arrowsOut) => {
  if (arrowsOut)
    text = ` ${selected ? Arrows.right : " "} ${text} ${selected ? Arrows.left : " "} `;
  else
    text = ` ${selected ? Arrows.left : " "} ${text} ${selected ? Arrows.right : " "} `;
  if (!selected)
    return text;
  return CH8.insert_format(selectedFormat, text);
};

// Simulator/Scenes/SimulationScreen.js
var Colors5 = DefaultColors;
var CH9 = new BasicConsole();
var slots = [
  { name: "TASKS", width: 9, getValue: (task) => CH9.hcenter("ID: " + CH9.insert_color(task.format?.color, "" + task.id), 9, " ", 1) },
  { name: "REM", width: 5, getValue: (task) => "" + task.remainingTime },
  { name: "ARR", width: 5, getValue: (task) => "" + task.arrivalTime },
  { name: "DEAD", width: 6, getValue: (task) => task.deadline ? "" + (task.arrivalTime + task.deadline) : "---" },
  { name: "PRIO", width: 6, getValue: (task) => "" + task.priority },
  { name: "PIN", width: 5, getValue: (task) => task.pinToCore !== null ? "" + task.pinToCore : "---" },
  { name: "END", width: 5, getValue: (task) => task.completedTime !== null ? "" + task.completedTime : "---" },
  { name: "STATUS", width: 10, getValue: (task) => task.status }
];
var tasksOption = [
  { title: "Current Tasks", desc: "These are the valid tasks seen by the scheduler." },
  { title: "All Tasks", desc: "These are all the tasks that has passed by the scheduler." },
  { title: "Finished Tasks", desc: "These are the tasks that have been completed or failed (missed deadline)." },
  { title: "Recently Finished Tasks", desc: "These are the tasks that are have completed or failed (missed deadline) in the last 20 time units." }
];
var SimulationScreen = class extends Scene {
  constructor(scheduler, config2) {
    super();
    this.config = config2;
    this.scheduler = scheduler;
    this.snapHistory = [];
    this.timer = null;
    this.chanceOfNewTask = config2.find((o) => o.name == "Chance of new task")?.value * 0.1 || 0.5;
    this.currentIndex = 0;
    this.selTaskIndex = -2;
    this.currentTaskIndex = 0;
    this.trackedTaskId = null;
  }
  onEnter() {
    delete this.snapHistory;
    this.snapHistory = [];
    this.snapHistory.push(this.scheduler.getSnapshot());
    this.scheduler.configure(this.config);
    this.chanceOfNewTask = this.config.find((o) => o.name == "Chance of new task")?.value * 0.1 || 0;
    this.currentIndex = 0;
    this.selTaskIndex = -2;
    this.currentTaskIndex = 0;
    this.trackedTaskId = null;
    this.play(true);
  }
  onExit() {
    clearInterval(this.timer);
    this.timer = null;
    this.setFinished(false);
  }
  play(play) {
    if (play) {
      if (this.timer)
        return;
      this.currentIndex = this.snapHistory.length - 1;
      this.timer = setInterval(() => {
        this.advanceTime();
        if (Math.random() < this.chanceOfNewTask) {
          this.scheduler.addRandomTask();
        }
      }, 100);
    } else {
      clearInterval(this.timer);
      this.timer = null;
      this.changed = true;
    }
  }
  keepTrackId() {
    if (this.trackedTaskId !== null) {
      const task = this.getTasks(this.currentTaskIndex).find((task2) => task2.id === this.trackedTaskId);
      if (task) {
        this.selTaskIndex = this.getTasks(this.currentTaskIndex).indexOf(task);
      } else {
        this.selTaskIndex = this.trackedTaskId === null ? -2 : 0;
      }
    }
  }
  getTasks = (index) => {
    if (index === 0)
      return this.snapHistory[this.currentIndex].validTasks;
    if (index === 1)
      return this.snapHistory[this.currentIndex].tasks;
    if (index === 2)
      return this.snapHistory[this.currentIndex].tasks.filter((task) => task.completedTime !== null);
    if (index === 3)
      return this.snapHistory[this.currentIndex].tasks.filter((task) => task.completedTime !== null && task.completedTime >= this.snapHistory[this.currentIndex].t - 20);
  };
  draw() {
    let text = CH9.getFigLet("Simulation");
    const live = "[\x1B[32mLIVE\x1B[0m]";
    const auto = "-[\x1B[33mAUTO\x1B[0m]-";
    const manual = "[\x1B[31mMANUAL\x1B[0m]";
    text += "\n";
    let line = delta + "t = " + CH9.hcenter("" + this.snapHistory[this.currentIndex].t, 7, "-", "left");
    line += this.currentIndex == this.snapHistory.length - 1 ? live : "-".repeat(6);
    line += this.timer ? auto : manual;
    text += CH9.hcenter(line, CH9.getWidth(), "-") + "\n";
    text += genProcessorsFrame(this.snapHistory, this.currentIndex);
    text = text.split("\n").slice(0, -1);
    let ll = text[text.length - 1].replaceAll(" ", "");
    const cmds = [
      { key: "p", desc: this.timer ? "Pause" : "Resume" },
      { key: "a", desc: "Add rnd task" },
      { key: enter, desc: "Inspect" },
      { key: Arrows.upDown + Arrows.leftRight, desc: "Navigate." }
    ];
    ll = ll + CH9.hcenter(cmds.map((obj) => {
      return `\x1B[1m${obj.key}\x1B[0m: ${CH9.insert_color(Colors5.LIGHTBLACK_EX, obj.desc)}`;
    }).join(" "), CH9.getWidth() - CH9.getLineWidth(ll), " ");
    text = text.slice(0, -1);
    text.push(ll);
    text = text.join("\n");
    text += "\n";
    const maxRows = CH9.getHeight() - CH9.getSize(text).height - 2;
    let tasksSpr = genTaskTable(this.getTasks(this.currentTaskIndex), slots, maxRows, {
      row: this.selTaskIndex,
      col: -1
    }, tasksOption[this.currentTaskIndex].title);
    if (this.selTaskIndex === -1) {
      const t2 = CH9.breakLine(tasksOption[this.currentTaskIndex].desc, (CH9.getWidth() - 60) / 2);
      const t_size = CH9.getSize(t2);
      tasksSpr = CH9.merge(tasksSpr, CH9.hcenter(t2, t_size.width), { padding: 4 });
    }
    text += CH9.hcenter(tasksSpr);
    text += "\n";
    return text;
  }
  advanceTime(reverse) {
    if (!reverse) {
      this.currentIndex++;
      if (this.currentIndex >= this.snapHistory.length) {
        this.currentIndex = this.snapHistory.length - 1;
        this.scheduler.tick();
        this.snapHistory.push(this.scheduler.getSnapshot());
        this.currentIndex++;
      }
    } else {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
      }
    }
    this.keepTrackId();
    this.changed = true;
  }
  handleInput(input, modifiers) {
    if (input == "enter") {
      if (this.selTaskIndex === -2) {
        this.selTaskIndex = -1;
      } else {
        this.selTaskIndex = -2;
        this.trackedTaskId = null;
      }
    } else if (input == "arrowup") {
      if (this.selTaskIndex > -2) {
        this.selTaskIndex--;
      }
      if (this.selTaskIndex >= 0)
        this.trackedTaskId = this.getTasks(this.currentTaskIndex)[this.selTaskIndex]?.id;
    } else if (input == "arrowdown") {
      if (this.selTaskIndex != -2) {
        this.selTaskIndex++;
        if (this.selTaskIndex >= this.getTasks(this.currentTaskIndex).length) {
          this.selTaskIndex = this.getTasks(this.currentTaskIndex).length - 1;
        }
        this.trackedTaskId = this.getTasks(this.currentTaskIndex)[this.selTaskIndex]?.id;
      }
    } else if (input == "arrowleft") {
      if (this.selTaskIndex == -1) {
        this.currentTaskIndex--;
        if (this.currentTaskIndex < 0) {
          this.currentTaskIndex = tasksOption.length - 1;
        }
        return;
      }
      this.advanceTime(true);
      if (this.timer) {
        this.play(false);
      }
    } else if (input == "arrowright") {
      if (this.selTaskIndex == -1) {
        this.currentTaskIndex++;
        if (this.currentTaskIndex >= tasksOption.length) {
          this.currentTaskIndex = 0;
        }
        return;
      }
      this.advanceTime();
      if (this.timer) {
        this.play(false);
      }
    } else if (input == "p" || input == "space") {
      this.play(!this.timer);
    } else if (input == "a") {
      this.scheduler.addRandomTask();
      this.changed = true;
    } else if (input == "q") {
      const oldplay = this.timer !== null;
      this.play(false);
      MsgBoxHandler.getInstance().raise(
        "Do you wish to quit the simulation?\nAll unsaved data will be lost.",
        "Quit Simulation",
        ["Yes", "No"],
        (response) => {
          if (response === 0)
            this.setFinished(true, Alias_default.mainMenu);
          else
            this.play(oldplay);
        }
      );
    }
  }
};

// Simulator/Scenes/OpeningAnimation.js
var CH10 = new BasicConsole();
var OpeningAnimation = class extends Scene {
  constructor(animation_ms, onFinish) {
    super();
    this.currentIndex = 0;
    this.timer = null;
    this.animation_ms = animation_ms;
    this.onFinish = onFinish;
  }
  onEnter() {
    this.start();
  }
  onExit() {
    clearInterval(this.timer);
    this.timer = null;
  }
  start() {
    this.currentIndex = 0;
    this.timer = setInterval(() => {
      this.currentIndex++;
      if (this.currentIndex > 75) {
        clearInterval(this.timer);
        this.timer = null;
        this.onFinish?.();
      }
      this.changed = true;
    }, this.animation_ms);
  }
  draw() {
    const perfectpaintedMw = CH10.getWidth() > 75 ? CH10.merge(
      CH10.paint(Assets_default.Logos.Mattedi, DefaultColors.custom_colors(39)),
      CH10.paint(Assets_default.Logos.Works, DefaultColors.custom_colors(208)),
      { padding: 0 }
    ) : CH10.paint(Assets_default.Logos.Mattedi, DefaultColors.custom_colors(39)) + CH10.paint(Assets_default.Logos.Works, DefaultColors.custom_colors(208));
    const maxIndex = perfectpaintedMw.split("\n").map((line) => {
      return CH10.getLineWidth(line);
    }).reduce((a, b) => Math.max(a, b), 0);
    if (this.currentIndex > maxIndex) {
      return CH10.hcenter(perfectpaintedMw, CH10.getWidth(), " ", this.alignment);
    } else {
      const text = perfectpaintedMw.split("\n").map((line) => {
        return CH10.getSafeSubstring(line, 0, this.currentIndex);
      }).join("\n");
      return CH10.hcenter(text);
    }
  }
  handleInput(input, modifiers) {
    if (input == "enter" || input == "space") {
      return Alias_default.wecome;
    }
  }
};

// Simulator/Scenes/SystemMenu.js
var CH11 = new BasicConsole();
var navOptions = ["Back", "Set Tasks", "Start Simulation"];
var SystemMenu = class extends Scene {
  constructor(options) {
    super();
    this.currentIndex = 0;
    this.navIndex = 0;
    this.options = options;
    this.showTimeQuantum = options.find((o) => o.name == "Scheduler Algorithm")?.value === AlgorithmModels.RR;
    this.timeQuantumIndex = options.findIndex((o) => o.name == "Time Quantum");
  }
  onEnter() {
    this.currentIndex = 0;
    this.navIndex = 0;
    this.showTimeQuantum = false;
    this.timeQuantumIndex = this.options.findIndex((o) => o.name == "Time Quantum");
  }
  draw() {
    let text = CH11.getFigLet("Configure System");
    text += "\n";
    text += "-".repeat(CH11.getWidth()) + "\n";
    text += CH11.hcenter(navOptions.map((option, index) => {
      return CH11.hcenter(formatText(option, this.navIndex == index && this.currentIndex == -1, true), Math.floor(CH11.getWidth() / option.length) - 4, " ");
    }).join(" ")) + "\n";
    text += this.options[this.currentIndex]?.desc + "\n";
    for (let i = 0; i < this.options.length; i++) {
      if (i === this.timeQuantumIndex && !this.showTimeQuantum) {
        continue;
      }
      let val = this.options[i].value;
      if (this.options[i].transformValue) {
        val = this.options[i].transformValue(val);
      }
      let line = `${this.options[i].name}: ${val}`;
      line = formatText(line, i === this.currentIndex, false);
      if (this.options[i].unit)
        line += ` (${this.options[i].unit})`;
      text += CH11.hcenter(line, CH11.getWidth(), " ", this.alignment) + "\n";
    }
    return text;
  }
  handleInput(input, modifiers) {
    if (input == "arrowleft") {
      if (this.currentIndex < 0) {
        this.navIndex--;
        return;
      }
      const option = this.options[this.currentIndex];
      option.value -= option.step;
      if (option.value < option.min) {
        option.value = option.max;
      }
      if (option.name == "Scheduler Algorithm") {
        this.showTimeQuantum = option.value === AlgorithmModels.RR;
      }
    }
    if (input == "arrowright") {
      if (this.currentIndex < 0) {
        this.navIndex++;
        return;
      }
      const option = this.options[this.currentIndex];
      option.value += option.step;
      if (option.name == "Chance of a new task") {
        option.value = Math.round(option.value * 10) / 10;
      }
      if (option.value > option.max) {
        option.value = option.min;
      }
      if (option.name == "Scheduler Algorithm") {
        this.showTimeQuantum = option.value === AlgorithmModels.RR;
      }
    }
    if (input == "arrowup") {
      this.currentIndex--;
      if (!this.showTimeQuantum && this.currentIndex === this.timeQuantumIndex)
        this.currentIndex--;
      if (this.currentIndex < -1) {
        this.currentIndex = -1;
      }
    }
    if (input == "arrowdown") {
      this.currentIndex++;
      if (!this.showTimeQuantum && this.currentIndex === this.timeQuantumIndex)
        this.currentIndex++;
      if (this.currentIndex >= this.options.length) {
        this.currentIndex = this.options.length - 1;
      }
    }
    if (input == "enter" || input == "space") {
      if (this.currentIndex == -1) {
        if (this.navIndex == 0) {
          return "back";
        }
        if (this.navIndex == 1) {
          return Alias_default.taskManager;
        }
        if (this.navIndex == 2) {
          return Alias_default.simulationScreen;
        }
      }
    }
  }
};

// Simulator/Scenes/TaskManager.js
var Colors6 = DefaultColors;
var CH12 = new BasicConsole();
var slots2 = [
  { name: "TASKS", width: 9, getValue: (task, index) => {
    return "ID: " + CH12.insert_color(Colors6.custom_colors(task.color), "" + task.id);
  } },
  { name: "BURST", width: 5, getValue: (task, index) => {
    return "" + task.burstTime;
  } },
  { name: "DEAD", width: 6, getValue: (task, index) => {
    return task.deadline ? "" + (task.arrivalTime + task.deadline) : "---";
  } },
  { name: "PRIO", width: 6, getValue: (task, index) => {
    return "" + task.priority;
  } },
  { name: "PIN", width: 5, getValue: (task, index) => {
    return task.pinToCore !== null ? "" + task.pinToCore : "---";
  } },
  { name: "CLR", width: 5, getValue: (task, index) => {
    return CH12.insert_color(Colors6.custom_colors(task.color), "" + task.color);
  } },
  { name: "PERI", width: 6, getValue: (task, index) => {
    return task.period > 0 ? "YES" : "NO";
  } }
];
var desc = [
  "The time (in time units) it takes to complete the task.",
  "The time (in time units) at which the task is expected to be completed.",
  "The priority of the task.",
  "The core to which the task is pinned.",
  "The color of the task.",
  "Whether the task is periodic or not. (only for tasks with a deadline)"
];
var bold = (text) => {
  return CH12.insert_format({ decoration: Decorations.Bold }, text);
};
var TaskScreen = class extends Scene {
  constructor(scheduler) {
    super();
    this.scheduler = scheduler;
    this.colIndex = 0;
    this.rowIndex = -2;
    this.editingTask = false;
    this.optionsIndex = 0;
  }
  onEnter() {
    this.colIndex = 0;
    this.rowIndex = -2;
    this.editingTask = false;
    this.optionsIndex = 0;
  }
  draw() {
    let text = CH12.getFigLet(`Task${CH12.getWidth() < 70 ? "\n" : " "}Manager`);
    text += "\n";
    text += CH12.hcenter("System-Config", CH12.getWidth(), "-") + "\n";
    let configs = ["Processors: " + this.scheduler.numProcessors, "Algorithm: " + this.scheduler.model.name, "Time Quantum: " + this.scheduler.timeQuantum, "Time Slice: " + this.scheduler.timeSlice];
    text += "|" + CH12.hcenter(configs.map((config2) => {
      return CH12.hcenter(config2, Math.floor(CH12.getWidth() / config2.length) - 1, " ");
    }).join(" "), CH12.getWidth() - 2) + "|\n";
    let nav = ["Back", "System Config", "Start Simulation"];
    text += "|" + CH12.hcenter(nav.map((nav2, index) => {
      return CH12.hcenter(formatText(nav2, this.rowIndex == -2 && this.optionsIndex == index, true), Math.floor(CH12.getWidth() / nav2.length) - 1, " ");
    }).join(" "), CH12.getWidth() - 2) + "|\n";
    text += "-".repeat(CH12.getWidth()) + "\n";
    const inputs = [
      {
        value: `(${Arrows.up})A`,
        text: "Add new Task (x10)"
      },
      {
        value: `D`,
        text: "Delete Task"
      },
      {
        value: `E`,
        text: "Edit Task"
      }
    ];
    const size = Math.floor((CH12.getWidth() - 2) / inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      text += CH12.hcenter(`${bold(inputs[i].value)}: ${inputs[i].text}`, size, " ", 1);
      if (i < inputs.length - 1) {
        text += " ";
      }
    }
    text += "\n";
    text += CH12.hcenter(genTaskTable(this.scheduler.tasks, slots2, CH12.getHeight() - 19, {
      col: this.editingTask ? this.colIndex + 1 : -1,
      row: this.rowIndex
    }, "Task List Editor"));
    text += "\n";
    if (this.colIndex >= 0 && this.rowIndex >= 0 && this.editingTask)
      text += desc[this.colIndex] + "\n";
    return text;
  }
  handleInput(input, modifiers) {
    if (input == "enter" || input == "space") {
      if (!this.editingTask && this.rowIndex >= 0) {
        this.editingTask = !this.editingTask;
      }
      if (this.rowIndex == -2) {
        if (this.optionsIndex == 0) {
          return -1;
        }
        if (this.optionsIndex == 1) {
          return Alias_default.systemMenu;
        }
        if (this.optionsIndex == 2) {
          return Alias_default.simulationScreen;
        }
      }
    }
    if (input == "a") {
      for (let i = 0; i < 1 + 9 * modifiers.shift; i++) {
        this.scheduler.addRandomTask();
      }
    }
    if (input == "e") {
      if (!this.editingTask && this.rowIndex >= 0) {
        this.editingTask = !this.editingTask;
      }
    }
    if (input == "arrowup") {
      if (this.editingTask && !modifiers.shift) {
        return;
      }
      this.rowIndex--;
      if (this.rowIndex < -2) {
        this.rowIndex = -2;
      }
      if (this.rowIndex == -1) {
        this.rowIndex = -2;
      }
    }
    if (input == "arrowdown") {
      if (this.editingTask && !modifiers.shift) {
        return;
      }
      this.rowIndex++;
      if (this.rowIndex >= this.scheduler.tasks.length) {
        this.rowIndex = this.scheduler.tasks.length - 1;
      }
      if (this.rowIndex == -1) {
        this.rowIndex = 0;
      }
    }
    if (input == "arrowleft") {
      if (this.editingTask) {
        this.colIndex--;
        if (this.colIndex < 0) {
          this.colIndex = slots2.length - 2;
        }
      }
      if (this.rowIndex == -2) {
        this.optionsIndex--;
        if (this.optionsIndex < 0) {
          this.optionsIndex = 2;
        }
      }
    }
    if (input == "arrowright") {
      if (this.editingTask) {
        this.colIndex++;
        if (this.colIndex >= slots2.length - 1) {
          this.colIndex = 0;
        }
      }
      if (this.rowIndex == -2) {
        this.optionsIndex++;
        if (this.optionsIndex > 2) {
          this.optionsIndex = 0;
        }
      }
    }
  }
};

// Simulator/Scenes/Menu.js
var CH13 = new BasicConsole();
var MainMenu = class extends Scene {
  constructor(object) {
    super();
    this.currentIndex = 0;
    this.options = [
      { text: "Start", response: Alias_default.simulationScreen },
      { text: "Task Manager", response: Alias_default.taskManager },
      { text: "Settings", response: Alias_default.systemMenu },
      { text: "Help", response: "-1" },
      { text: "Info", response: "-1" },
      { text: "Exit", response: "Exit" }
    ];
  }
  start() {
    this.currentIndex = 0;
    this.timer = setInterval(() => {
      this.currentIndex++;
      if (this.currentIndex > 75) {
        clearInterval(this.timer);
        this.timer = null;
        this.finshed = true;
        return 1;
      }
      this.changed = true;
    }, this.animation_ms);
  }
  draw() {
    let text = CH13.getFigLet("Main Menu");
    text += "\n";
    text += "-".repeat(CH13.getWidth()) + "\n";
    text += CH13.hcenter("Select an option", CH13.getWidth(), " ", 1) + "\n";
    text += CH13.hcenter("Use arrow keys to navigate", CH13.getWidth(), " ", 1) + "\n";
    for (let i = 0; i < this.options.length; i++) {
      let line = this.options[i].text;
      line = formatText(line, i === this.currentIndex, i == this.options.length - 1 || i == 0);
      text += CH13.hcenter(line, CH13.getWidth(), " ", this.alignment) + "\n";
    }
    return text;
  }
  handleInput(input, modifiers) {
    if (input == "esc") {
      return "back";
    }
    if (input == "arrowup") {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
      }
    }
    if (input == "arrowdown") {
      this.currentIndex++;
      if (this.currentIndex >= this.options.length) {
        this.currentIndex = this.options.length - 1;
      }
    }
    if (input == "enter" || input == "space") {
      return this.options[this.currentIndex].response;
    }
  }
};

// Simulator/Simulator.js
var Simulator = class {
  #Version = "0.1.0";
  get Version() {
    return this.#Version;
  }
  constructor() {
    this.states = [];
    this.timer = null;
    this.scheduler = new Scheduler(6);
    this.snapshots = [];
    this.currentSnapshot = 0;
    this.systemConfig = [
      { name: "Processors", value: 1, min: 1, max: 10, step: 1 },
      { name: "Scheduler Algorithm", value: 0, min: 0, max: AlgorithmModels.length - 1, step: 1, transformValue: (value) => {
        return `${AlgorithmModels.getName(value)}`;
      } },
      { name: "Time Quantum", value: 1, min: 1, max: 10, step: 1, unit: delta + "t's" },
      { name: "Chance of new task", value: 1, min: 0, max: 10, step: 1, transformValue: (value) => {
        return value * 10 + `%`;
      } },
      { name: "Auto Time Step", value: 20, min: 0, max: Infinity, step: 20, unit: "ms" }
    ];
    this.index = 0;
    this.maxIndex = 0;
    this.firstChar = true;
    for (let i = 0; i < 10; i++) {
      this.scheduler.addRandomTask();
    }
    this.snapshots.push(this.scheduler.getSnapshot());
    this.Engine = new ConsoleEngine();
    this.Engine.msgBox.raise("Simulator", "Welcome to the Simulator", []);
    this.Engine.setMinSize(60, 21);
    this.Engine.addScene(new OpeningAnimation(15, () => {
      setTimeout(() => {
        const res = this.Engine.goToScene(Alias_default.wecome, "finishOpeningAnimation");
      }, 500);
    }), Alias_default.openingAnimation);
    this.Engine.targetFPS(60);
    this.Engine.addScene(new welcomeScreen(), Alias_default.wecome);
    this.Engine.addScene(new MainMenu(), Alias_default.mainMenu);
    this.Engine.addScene(new SimulationScreen(this.scheduler, this.systemConfig), Alias_default.simulationScreen);
    this.Engine.addScene(new TaskScreen(this.scheduler), Alias_default.taskManager);
    this.Engine.addScene(new SystemMenu(this.systemConfig), Alias_default.systemMenu);
    this.Engine.goToScene(Alias_default.openingAnimation);
  }
  start() {
  }
  //This should be called when an input is received
  handleInput(input, modifiers) {
    this.Engine.handleInput(input, modifiers);
  }
  //This should be called when the window is resized
  resize() {
    const res = this.Engine.resize();
    if (!res) {
    }
  }
  setupExit(fn) {
    if (typeof fn !== "function") {
      return;
    }
    this.Engine.onExit = fn;
  }
};

// main.js
var import_fs = __toESM(require("fs"), 1);
var sim = new Simulator();
var CH14 = new BasicConsole();
CH14.setTitle("Scheduler Simulator");
CH14.show_cursor(false);
CH14.clear_screen();
import_process.default.stdin.setRawMode(true);
import_readline.default.emitKeypressEvents(import_process.default.stdin);
sim.start();
var config = sim.systemConfig.map((item) => {
  return { name: item.name, value: item.value };
});
if (import_fs.default.existsSync("./systemconfig.json")) {
  const file = import_fs.default.readFile("./systemconfig.json", "utf8", (err, data) => {
    if (err) {
      return;
    }
    const config2 = JSON.parse(data);
    console.log(config2);
    console.clear();
  });
}
var t = {
  Comment: "This file is generated by the Scheduler Simulator. Do not edit it manually.",
  Version: sim.Version,
  Date: (/* @__PURE__ */ new Date()).toLocaleString("pt-BR"),
  Data: sim.systemConfig.map((item) => {
    return { name: item.name, value: item.value };
  })
};
import_fs.default.writeFileSync("./systemconfig.json", JSON.stringify(t, null, 2), "utf8");
var silentStart = false;
if (import_process.argv.length > 2) {
  for (let i = 2; i < import_process.argv.length; i++) {
    if (import_process.argv[i] == "--help" || import_process.argv[i] == "-h") {
      console.log("Scheduler Simulator - Help");
      console.log("Usage: node main.js [options]");
      console.log("Options:");
      console.log("--help, -h: Show this help message and exit.");
      console.log("--config, -c: Show the current configuration.");
      console.log("--version, -v: Show the version of the simulator.");
      import_process.default.exit(0);
    } else if (import_process.argv[i] == "-f") {
      if (import_process.argv[i + 1]) {
        const fileName = import_process.argv[i + 1];
        if (!fileName.endsWith(".json")) {
          MsgBoxHandler.getInstance().raise("File must be a .json", "Error loading tasks File", ["OK"]);
        } else if (!import_fs.default.existsSync(fileName)) {
          MsgBoxHandler.getInstance().raise("File: " + fileName + " does not exist", "Error loading tasks File", ["OK"]);
        } else {
          const file = import_fs.default.readFileSync(fileName, "utf8", (err, data) => {
            if (err) {
              MsgBoxHandler.getInstance().raise("Error", err, ["OK"]);
            }
            if (data) {
              const tasks = JSON.parse(data);
              const validTasks = [];
              if (tasks.length > 0) {
                tasks.forEach((task) => {
                  if (task.name && task.time && task.priority) {
                    validTasks.push(new Task(task.burstTime, task.priority, task.deadline, task.pinToCore));
                  } else {
                    MsgBoxHandler.getInstance().raise("Error", "Invalid task format", ["OK"]);
                  }
                });
              }
            }
          });
        }
        i++;
      }
    } else if (import_process.argv[i] == "--version" || import_process.argv[i] == "-v") {
      console.log("Scheduler Simulator Version: " + sim.Version);
      console.log("Engine Version: " + sim.Engine.Version);
      import_process.default.exit(0);
    } else if (import_process.argv[i] == "-s" || import_process.argv[i] == "-silent") {
      silentStart = true;
    }
  }
}
sim.setupExit(
  () => {
    console.clear();
    import_process.default.exit(0);
  }
);
if (silentStart) {
  sim.Engine.goToScene(Alias_default.simulationScreen);
}
import_process.default.stdout.on("resize", () => {
  sim.resize();
});
import_process.default.stdin.on("keypress", (key, data) => {
  let input = "";
  if (typeof data.name === "undefined") {
    input = data.sequence;
  } else if (data.name === "up") input = "arrowup";
  else if (data.name === "down") input = "arrowdown";
  else if (data.name === "left") input = "arrowleft";
  else if (data.name === "right") input = "arrowright";
  else if (data.name === "space") input = "space";
  else if (data.name === "return") input = "enter";
  else if (data.name === "escape") input = "esc";
  else if (data.name === "backspace") input = "backspace";
  else input = data.name;
  if (data && data.ctrl && data.name === "c") {
    console.clear();
    CH14.write("\x1B[3J");
    CH14.show_cursor(true);
    import_process.default.exit();
  }
  sim.handleInput(input, {
    ctrl: data.ctrl,
    shift: data.shift,
    alt: data.alt
  });
});
