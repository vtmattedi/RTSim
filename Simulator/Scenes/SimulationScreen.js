import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, Decorations, DefaultColors } from '../Engine/ConsoleHelp.js';
import { genProcessorsFrame, genTaskTable } from '../Scheduler/FramesHelper.js';
import { Arrows, delta, enter } from '../Engine/Symbols.js';
import { MsgBoxHandler } from '../Engine/messageBox.js';
import Assets from '../Engine/Assets/Assets.js';
import SceneAlias from './Alias.js';
import { Scheduler } from '../Scheduler/Scheduler.js';
const Colors = DefaultColors;
const CH = new BasicConsole();

const slots = [
  { name: "TASKS", width: 9, getValue: (task) => {return CH.hcenter("ID: " + CH.insert_color(Colors.custom_colors(task.color), "" + task.id), 9, " ", 1) }},
  { name: "REM", width: 5, getValue: (task) => "" + task.remainingTime },
  { name: "BURST", width: 5, getValue: (task) => "" + task.burstTime },
  { name: "ARR", width: 5, getValue: (task) => "" + task.arrivalTime },
  { name: "DEAD", width: 6, getValue: (task) => task.deadline ? "" + (task.arrivalTime + task.deadline) : "---" },
  { name: "PRIO", width: 6, getValue: (task) => "" + task.priority },
  { name: "PIN", width: 5, getValue: (task) => task.pinToCore !== null ? "" + task.pinToCore : "---" },
  { name: "END", width: 5, getValue: (task) => task.completedTime !== null ? "" + task.completedTime : "---" },
  { name: "STATUS", width: 10, getValue: (task) => task.status },
  { name: "TA", width: 3, getValue: (task) => task.turnAround !== null ? "" + task.turnAround : "---" },
  { name: "RT", width: 3, getValue: (task) => task.responseTime !== null ? "" + task.responseTime : "---" },
  { name: "WT", width: 3, getValue: (task) => task.waitingTime !== null ? "" + task.waitingTime : "---" },
]

const tasksOption = [
  { title: "Current Tasks", desc: "These are the valid tasks seen by the scheduler." },
  { title: "All Tasks", desc: "These are all the tasks that has passed by the scheduler." },
  { title: "Finished Tasks", desc: "These are the tasks that have been completed or failed (missed deadline)." },
  { title: "Recently Finished Tasks", desc: "These are the tasks that are have completed or failed (missed deadline) in the last 20 time units." },

]
class SimulationScreen extends Scene {
  constructor(scheduler, config) {
    super();
    this.config = config;
    this.scheduler = scheduler;
    this.snapHistory = [];
    this.timer = null;
    this.chanceOfNewTask = config.find(o => o.name === "Chance of new task")?.value * 0.1 || 0.5;
    this.currentIndex = 0;
    this.selTaskIndex = -2;
    this.currentTaskIndex = 0;
    this.trackedTaskId = null;

  }
  onEnter() {
    this.scheduler.configure(this.config);
    delete this.snapHistory;
    this.snapHistory = []
    this.snapHistory.push(this.scheduler.getSnapshot());
    this.chanceOfNewTask = this.config.find(o => o.name === "Chance of new task")?.value * 0.1 || 0;
    this.currentIndex = 0;
    this.selTaskIndex = -2;
    this.currentTaskIndex = 0;
    this.trackedTaskId = null;
    this.play(true);
  };
  onExit() {
    clearInterval(this.timer);
    this.timer = null;
    this.setFinished(false);
  }
  play(play) {
    //start automatic simulation
    if (play) {
      if (this.timer)
        return;
      this.currentIndex = this.snapHistory.length - 1;
      this.timer = setInterval(() => {
        this.advanceTime();
        if (Math.random() < this.chanceOfNewTask) {
          this.scheduler.addRandomTask();
        }}, 100);
    }
    //stop automatic simulation
    else {
      clearInterval(this.timer);
      this.timer = null;
      this.changed = true;
    }
  }
  keepTrackId() {
    if (this.trackedTaskId !== null) {
      const task = this.getTasks(this.currentTaskIndex).find(task => task.id === this.trackedTaskId);
      if (task) {
        this.selTaskIndex = this.getTasks(this.currentTaskIndex).indexOf(task);
      }
      else {
        this.selTaskIndex = this.trackedTaskId === null ? -2 : 0;
      }
    }
  }
  getTasks = (index) => {
    if (index === 0)
      return this.snapHistory[this.currentIndex].validTasks
    if (index === 1)
      return this.snapHistory[this.currentIndex].tasks
    if (index === 2)
      return this.snapHistory[this.currentIndex].tasks.filter(task => task.completedTime !== null)
    if (index === 3)
      return this.snapHistory[this.currentIndex].tasks.filter(task => task.completedTime !== null && task.completedTime >= this.snapHistory[this.currentIndex].t - 20)
  }
  draw() {
    let text = CH.getFigLet("Simulation");
    const live = "[\x1b[32mLIVE\x1b[0m]";
    const auto = "-[\x1b[33mAUTO\x1b[0m]-";
    const manual = "[\x1b[31mMANUAL\x1b[0m]";
    text += "\n\n";
    let line = delta + "t = " + CH.hcenter("" + this.snapHistory[this.currentIndex].t, 7, "-", "left");
    line += this.currentIndex === this.snapHistory.length - 1 ? live : "-".repeat(6);
    line += this.timer ? auto : manual;
    line = CH.hcenter("Model: " + this.snapHistory[this.currentIndex].model, CH.getWidth()/4, "-") + line;
    text += CH.hcenter(line, CH.getWidth(), "-") + "\n";
    text += genProcessorsFrame(this.snapHistory, this.currentIndex);
    text = text.split("\n").slice(0, -1);
    // Processor Frame always have 1 more line than the graph
    // So we can use that space to add the valid commands
    let lastLine = text[text.length - 1].replaceAll(" ", "");
    const cmds = [
      { key: "p", desc: this.timer ? "Pause" : "Resume" },
      { key: "a", desc: "Add rnd task" },
      { key: "q", desc: "Quit" },
      { key: enter, desc: "Inspect" },
      { key: Arrows.upDown + Arrows.leftRight, desc: "Navigate." },
    ]


    lastLine = lastLine + CH.hcenter(cmds.map((obj) => {
      return `\x1b[1m${obj.key}\x1b[0m: ${CH.insert_color(Colors.LIGHTBLACK_EX, obj.desc)}`
    }).join(" "), CH.getWidth() - CH.getLineWidth(lastLine), " ");
    text = text.slice(0, -1);
    text.push(lastLine);
    text = text.join("\n");
    text += "\n";
    const maxRows = CH.getHeight() - CH.getSize(text).height - 2;


    let tasksSpr = genTaskTable(this.getTasks(this.currentTaskIndex), slots, maxRows, {
      row: this.selTaskIndex,
      col: -1,
    }, tasksOption[this.currentTaskIndex].title);
    if (this.selTaskIndex === -1) {
      const t = CH.breakLine(tasksOption[this.currentTaskIndex].desc, (CH.getWidth() - 60) / 2);
      const t_size = CH.getSize(t);
      tasksSpr = CH.merge(tasksSpr, CH.hcenter(t, t_size.width), { padding: 4 })
    }
    if (this.getTasks(this.currentTaskIndex).length > Infinity) {
      console.log(this.getTasks(this.currentTaskIndex), this.getTasks(this.currentTaskIndex)[0].color);
      process.exit();
    }
    const stats = []
    const length = this.snapHistory[this.currentIndex].tasks.length;
    stats.push ("+"+ CH.hcenter("TASKS: " + length, 16, "-") + "+")
    const totalTA = this.snapHistory[this.currentIndex].tasks.reduce((acc, task) => {
      return acc + (task.turnAround !== null ? task.turnAround : 0);
    }, 0) 
    const totalRT = this.snapHistory[this.currentIndex].tasks.reduce((acc, task) => {
      return acc + (task.responseTime !== null ? task.responseTime : 0);
    }, 0)
    const totalWT = this.snapHistory[this.currentIndex].tasks.reduce((acc, task) => {
      return acc + (task.waitingTime !== null ? task.waitingTime : 0);
    }, 0)
    stats.push("AVG TA: " +  (totalTA/length).toFixed(2) + " t.u.");
    stats.push("AVG RT: " +  (totalRT/length).toFixed(2) + " t.u.");
    stats.push("AVG WT: " +  (totalWT/length).toFixed(2) + " t.u.");
    // tasksSpr = CH.merge(
    //   stats.join("\n"),
    //   tasksSpr,
    //   { padding: 0, align: "top" }
    // )
    text += CH.hcenter(tasksSpr);
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
    }
    else {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
      }
    }
    this.keepTrackId();
    this.changed = true;
  }
  handleInput(input, modifiers) {
    //Enter or Space to enter the task selection mode
    if (input === "enter") {
      if (this.selTaskIndex === -2) {
        this.selTaskIndex = -1;
      } else {
        this.selTaskIndex = -2;
        this.trackedTaskId = null;
      }
    }
    //Arrow keys to navigate the task list
    else if (input === "arrowup") {
      if (this.selTaskIndex > -2) {
        this.selTaskIndex--;
      }
      if (this.selTaskIndex >= 0)
        this.trackedTaskId = this.getTasks(this.currentTaskIndex)[this.selTaskIndex]?.id;
      else 
        this.trackedTaskId = null;
    }
    else if (input === "arrowdown") {
      if (this.selTaskIndex != -2) {
        this.selTaskIndex++;
        if (this.selTaskIndex >= this.getTasks(this.currentTaskIndex).length) {
          this.selTaskIndex = this.getTasks(this.currentTaskIndex).length - 1;
        }
        this.trackedTaskId = this.getTasks(this.currentTaskIndex)[this.selTaskIndex]?.id;
      }
    }
    else if (input === "arrowleft") {
      if (this.selTaskIndex === -1) {
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
    }
    else if (input === "arrowright") {
      if (this.selTaskIndex === -1) {
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
    }
    // p to pause or play the simulation
    // (automatic advance time)
    else if (input === "p" || input === "space") {
      this.play(!this.timer);
    }
    else if (input === "a") {
      for (let i = 0; i < 1 + modifiers.shift * 9; i++) {
        this.scheduler.addRandomTask();
      }
      this.changed = true;
    }
    else if (input === "q" || input === "esc") {
      const oldplay = this.timer !== null;
      this.play(false);
      MsgBoxHandler.getInstance().raise(
        "Do you wish to quit the simulation?\nAll unsaved data will be lost.",
        "Quit Simulation",
        ["Yes", "No"],
        (response) => {
          if (response === 0)
            this.setFinished(true, SceneAlias.mainMenu);
          else
            this.play(oldplay);
        })
    }
  }
}

export { SimulationScreen };