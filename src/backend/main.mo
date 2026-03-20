import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authentication state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Custom data types
  public type Goal = {
    id : Nat;
    title : Text;
    reason : Text;
    userId : Principal;
    createdAt : Int;
  };

  public type Task = {
    id : Nat;
    name : Text;
    completed : Bool;
    date : Text;
    goalId : Nat;
    userId : Principal;
    createdAt : Int;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let goals = Map.empty<Nat, Goal>();
  let tasks = Map.empty<Nat, Task>();
  var nextGoalId = 0;
  var nextTaskId = 0;

  // Comparison for sorting by createdAt
  module Goal {
    public func compare(g1 : Goal, g2 : Goal) : Order.Order {
      switch (Nat.compare(g1.id, g2.id)) {
        case (#equal) { Text.compare(g1.title, g2.title) };
        case (order) { order };
      };
    };
  };
  module Task {
    public func compareByDate(t1 : Task, t2 : Task) : Order.Order {
      switch (Text.compare(t1.date, t2.date)) {
        case (#equal) { Nat.compare(t1.id, t2.id) };
        case (ordering) { ordering };
      };
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Goal CRUD
  public shared ({ caller }) func createGoal(title : Text, reason : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create goals");
    };

    let goal : Goal = {
      id = nextGoalId;
      title;
      reason;
      userId = caller;
      createdAt = Time.now();
    };

    goals.add(nextGoalId, goal);
    nextGoalId += 1;
    goal.id;
  };

  func getAllGoalsInternal(userId : Principal) : [Goal] {
    let results = List.empty<Goal>();
    for ((_, goal) in goals.entries()) {
      if (goal.userId == userId) {
        results.add(goal);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getGoalsForCurrentUser() : async [Goal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their own goals");
    };
    getAllGoalsInternal(caller);
  };

  public shared ({ caller }) func updateGoal(id : Nat, title : Text, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };

    let goal = switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) { goal };
    };

    if (goal.userId != caller) {
      Runtime.trap("Unauthorized: Cannot update others' goals");
    };

    let updatedGoal : Goal = {
      id;
      title;
      reason;
      userId = caller;
      createdAt = goal.createdAt;
    };

    goals.add(id, updatedGoal);
  };

  public shared ({ caller }) func deleteGoal(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete goals");
    };

    let goal = switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) { goal };
    };

    if (goal.userId != caller) {
      Runtime.trap("Unauthorized: Cannot delete others' goals");
    };

    goals.remove(id);
  };

  // Task CRUD
  public shared ({ caller }) func createTask(name : Text, date : Text, goalId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    // Check if the goal exists for the caller
    let goal = switch (goals.get(goalId)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) { goal };
    };
    if (goal.userId != caller) {
      Runtime.trap("Unauthorized: Cannot add task to others' goals");
    };

    let task : Task = {
      id = nextTaskId;
      name;
      completed = false;
      date;
      goalId;
      userId = caller;
      createdAt = Time.now();
    };

    tasks.add(nextTaskId, task);
    nextTaskId += 1;
    task.id;
  };

  public query ({ caller }) func getTasksForCurrentUser() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their own tasks");
    };
    tasks.values().filter(func(taskValue) { taskValue.userId == caller }).toArray();
  };

  public shared ({ caller }) func updateTask(id : Nat, name : Text, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let task = switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    if (task.userId != caller) {
      Runtime.trap("Unauthorized: Cannot update others' tasks");
    };

    let updatedTask : Task = {
      id;
      name;
      completed = task.completed;
      date;
      goalId = task.goalId;
      userId = caller;
      createdAt = task.createdAt;
    };

    tasks.add(id, updatedTask);
  };

  // Helper function to toggle task completion
  func toggleTaskCompletionInternal(caller : Principal, id : Nat, markComplete : Bool) : () {
    let task = switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    if (task.userId != caller) {
      Runtime.trap("Unauthorized: Cannot update others' tasks");
    };

    let updatedTask : Task = {
      id;
      name = task.name;
      completed = markComplete;
      date = task.date;
      goalId = task.goalId;
      userId = caller;
      createdAt = task.createdAt;
    };

    tasks.add(id, updatedTask);
  };

  public shared ({ caller }) func completeTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };
    toggleTaskCompletionInternal(caller, id, true);
  };

  public shared ({ caller }) func uncompleteTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark tasks as incomplete");
    };
    toggleTaskCompletionInternal(caller, id, false);
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    let task = switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };
    if (task.userId != caller) {
      Runtime.trap("Unauthorized: Cannot delete others' tasks");
    };

    tasks.remove(id);
  };

  // Query public functions
  public query ({ caller }) func getTasksForDate(date : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get tasks for a date");
    };
    tasks.values().filter(func(taskValue) { taskValue.userId == caller and taskValue.date == date }).toArray();
  };

  public query ({ caller }) func getTasksForGoal(goalId : Nat) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get tasks for a goal");
    };
    tasks.values().filter(func(taskValue) { taskValue.userId == caller and taskValue.goalId == goalId }).toArray();
  };

  public query ({ caller }) func getCompletedTaskDatesForCurrentUser() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get completed task dates");
    };
    tasks.values().filter(func(taskValue) { taskValue.userId == caller and taskValue.completed }).map(func(task) { task.date }).toArray();
  };

  public query ({ caller }) func getCompletedTaskCountToday(today : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get completed task count");
    };
    tasks.values().filter(func(taskValue) { taskValue.userId == caller and taskValue.completed and taskValue.date == today }).toArray().size();
  };
};
