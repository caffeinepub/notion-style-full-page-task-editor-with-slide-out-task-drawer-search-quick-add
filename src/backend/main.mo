import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Float "mo:base/Float";




actor {
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  public type ProjectId = Nat;
  public type TaskId = Nat;

  public type Project = {
    id : ProjectId;
    name : Text;
    color : Text;
    icon : Text;
    createdAt : Time.Time;
    owner : Principal;
  };

  public type Task = {
    id : TaskId;
    title : Text;
    description : ?Text;
    longFormContent : ?Text;
    dueDate : Time.Time;
    completed : Bool;
    projectId : ?ProjectId;
    createdAt : Time.Time;
    owner : Principal;
    completionDate : ?Time.Time;
    priority : Text;
  };

  public type UserPreferences = {
    themeMode : Text;
    defaultView : Text;
  };

  public type ProjectStats = {
    projectId : ProjectId;
    totalTasks : Nat;
    completedTasks : Nat;
    overdueTasks : Nat;
    completionRate : Float;
    overdueRate : Float;
  };

  public type TimePeriodStats = {
    period : Text;
    totalTasks : Nat;
    completedTasks : Nat;
    pendingTasks : Nat;
    completionRate : Float;
  };

  public type ProductivityInsights = {
    mostProductiveDay : ?Time.Time;
    longestStreak : Nat;
    mostActiveProject : ?ProjectId;
  };

  public type OverviewData = {
    totalTasks : Nat;
    totalProjects : Nat;
    weeklyStats : TimePeriodStats;
    monthlyStats : TimePeriodStats;
    yearlyStats : TimePeriodStats;
    projectStats : [ProjectStats];
    productivityInsights : ProductivityInsights;
  };

  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);

  var nextProjectId : ProjectId = 1;
  var nextTaskId : TaskId = 1;

  var projects = natMap.empty<Project>();
  var tasks = natMap.empty<Task>();
  var userPreferences = principalMap.empty<UserPreferences>();

  private func isProjectOwner(caller : Principal, projectId : ProjectId) : Bool {
    switch (natMap.get(projects, projectId)) {
      case (null) { false };
      case (?project) { Principal.equal(project.owner, caller) };
    };
  };

  private func isTaskOwner(caller : Principal, taskId : TaskId) : Bool {
    switch (natMap.get(tasks, taskId)) {
      case (null) { false };
      case (?task) { Principal.equal(task.owner, caller) };
    };
  };

  public shared ({ caller }) func createProject(name : Text, color : Text, icon : Text) : async ProjectId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create projects");
    };

    let projectId = nextProjectId;
    nextProjectId += 1;

    let project : Project = {
      id = projectId;
      name;
      color;
      icon;
      createdAt = Time.now();
      owner = caller;
    };

    projects := natMap.put(projects, projectId, project);
    projectId;
  };

  public shared ({ caller }) func deleteProject(projectId : ProjectId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete projects");
    };

    switch (natMap.get(projects, projectId)) {
      case (null) { Debug.trap("Project not found") };
      case (?project) {
        if (not Principal.equal(project.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only delete your own projects");
        };
        projects := natMap.delete(projects, projectId);

        let allTasks = Iter.toArray(natMap.entries(tasks));
        for ((taskId, task) in allTasks.vals()) {
          if (task.projectId == ?projectId) {
            tasks := natMap.delete(tasks, taskId);
          };
        };
      };
    };
  };

  public query ({ caller }) func getProject(projectId : ProjectId) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view projects");
    };

    switch (natMap.get(projects, projectId)) {
      case (null) { Debug.trap("Project not found") };
      case (?project) {
        if (not Principal.equal(project.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only view your own projects");
        };
        project;
      };
    };
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view projects");
    };

    let allProjects = Iter.toArray(natMap.vals(projects));

    if (AccessControl.isAdmin(accessControlState, caller)) {
      allProjects;
    } else {
      Array.filter<Project>(allProjects, func(project) { Principal.equal(project.owner, caller) });
    };
  };

  public shared ({ caller }) func createTask(title : Text, description : ?Text, dueDate : Time.Time, projectId : ?ProjectId, priority : Text) : async TaskId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can create tasks");
    };

    switch (projectId) {
      case (null) {
        // Create task without project
        let taskId = nextTaskId;
        nextTaskId += 1;

        let task : Task = {
          id = taskId;
          title;
          description;
          longFormContent = null;
          dueDate;
          completed = false;
          projectId = null;
          createdAt = Time.now();
          owner = caller;
          completionDate = null;
          priority;
        };

        tasks := natMap.put(tasks, taskId, task);
        taskId;
      };
      case (?validProjectId) {
        switch (natMap.get(projects, validProjectId)) {
          case (null) { Debug.trap("Project not found") };
          case (?project) {
            if (not Principal.equal(project.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
              Debug.trap("Unauthorized: You can only create tasks in your own projects");
            };

            let taskId = nextTaskId;
            nextTaskId += 1;

            let task : Task = {
              id = taskId;
              title;
              description;
              longFormContent = null;
              dueDate;
              completed = false;
              projectId = ?validProjectId;
              createdAt = Time.now();
              owner = caller;
              completionDate = null;
              priority;
            };

            tasks := natMap.put(tasks, taskId, task);
            taskId;
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateTask(taskId : TaskId, title : Text, description : ?Text, dueDate : Time.Time, priority : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update tasks");
    };

    switch (natMap.get(tasks, taskId)) {
      case (null) { Debug.trap("Task not found") };
      case (?task) {
        if (not Principal.equal(task.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only update your own tasks");
        };

        let updatedTask : Task = {
          id = task.id;
          title;
          description;
          longFormContent = task.longFormContent;
          dueDate;
          completed = task.completed;
          projectId = task.projectId;
          createdAt = task.createdAt;
          owner = task.owner;
          completionDate = task.completionDate;
          priority;
        };

        tasks := natMap.put(tasks, taskId, updatedTask);
      };
    };
  };

  public shared ({ caller }) func updateTaskProject(taskId : TaskId, newProjectId : ?ProjectId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update tasks");
    };

    switch (natMap.get(tasks, taskId)) {
      case (null) { Debug.trap("Task not found") };
      case (?task) {
        if (not Principal.equal(task.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only update your own tasks");
        };

        switch (newProjectId) {
          case (null) {
            // Remove project assignment
            let updatedTask : Task = {
              id = task.id;
              title = task.title;
              description = task.description;
              longFormContent = task.longFormContent;
              dueDate = task.dueDate;
              completed = task.completed;
              projectId = null;
              createdAt = task.createdAt;
              owner = task.owner;
              completionDate = task.completionDate;
              priority = task.priority;
            };
            tasks := natMap.put(tasks, taskId, updatedTask);
          };
          case (?validProjectId) {
            switch (natMap.get(projects, validProjectId)) {
              case (null) { Debug.trap("Target project not found") };
              case (?newProject) {
                if (not Principal.equal(newProject.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
                  Debug.trap("Unauthorized: You can only move tasks to your own projects");
                };

                let updatedTask : Task = {
                  id = task.id;
                  title = task.title;
                  description = task.description;
                  longFormContent = task.longFormContent;
                  dueDate = task.dueDate;
                  completed = task.completed;
                  projectId = ?validProjectId;
                  createdAt = task.createdAt;
                  owner = task.owner;
                  completionDate = task.completionDate;
                  priority = task.priority;
                };

                tasks := natMap.put(tasks, taskId, updatedTask);
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete tasks");
    };

    switch (natMap.get(tasks, taskId)) {
      case (null) { Debug.trap("Task not found") };
      case (?task) {
        if (not Principal.equal(task.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only delete your own tasks");
        };
        tasks := natMap.delete(tasks, taskId);
      };
    };
  };

  public shared ({ caller }) func toggleTaskCompletion(taskId : TaskId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update tasks");
    };

    switch (natMap.get(tasks, taskId)) {
      case (null) { Debug.trap("Task not found") };
      case (?task) {
        if (not Principal.equal(task.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only update your own tasks");
        };

        let now = Time.now();
        let updatedTask : Task = {
          id = task.id;
          title = task.title;
          description = task.description;
          longFormContent = task.longFormContent;
          dueDate = task.dueDate;
          completed = not task.completed;
          projectId = task.projectId;
          createdAt = task.createdAt;
          owner = task.owner;
          completionDate = if (not task.completed) { ?now } else { null };
          priority = task.priority;
        };

        tasks := natMap.put(tasks, taskId, updatedTask);
      };
    };
  };

  public shared ({ caller }) func updateTaskContent(taskId : TaskId, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can update task content");
    };

    switch (natMap.get(tasks, taskId)) {
      case (null) { Debug.trap("Task not found") };
      case (?task) {
        if (not Principal.equal(task.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only update your own tasks");
        };

        let updatedTask : Task = {
          task with longFormContent = ?content
        };

        tasks := natMap.put(tasks, taskId, updatedTask);
      };
    };
  };

  public query ({ caller }) func getTaskContent(taskId : TaskId) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view task content");
    };

    switch (natMap.get(tasks, taskId)) {
      case (null) { Debug.trap("Task not found") };
      case (?task) {
        if (not Principal.equal(task.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only view your own tasks");
        };
        task.longFormContent;
      };
    };
  };

  public query ({ caller }) func getTask(taskId : TaskId) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view tasks");
    };

    switch (natMap.get(tasks, taskId)) {
      case (null) { Debug.trap("Task not found") };
      case (?task) {
        if (not Principal.equal(task.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only view your own tasks");
        };
        task;
      };
    };
  };

  public query ({ caller }) func getTasksByProject(projectId : ProjectId) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view tasks");
    };

    switch (natMap.get(projects, projectId)) {
      case (null) { Debug.trap("Project not found") };
      case (?project) {
        if (not Principal.equal(project.owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Debug.trap("Unauthorized: You can only view tasks from your own projects");
        };

        let allTasks = Iter.toArray(natMap.vals(tasks));
        Array.filter<Task>(allTasks, func(task) { task.projectId == ?projectId });
      };
    };
  };

  public query ({ caller }) func getTasksByDateRange(startDate : Time.Time, endDate : Time.Time) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view tasks");
    };

    let allTasks = Iter.toArray(natMap.vals(tasks));
    let userTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      allTasks;
    } else {
      Array.filter<Task>(allTasks, func(task) { Principal.equal(task.owner, caller) });
    };

    Array.filter<Task>(
      userTasks,
      func(task) {
        task.dueDate >= startDate and task.dueDate <= endDate
      },
    );
  };

  public query ({ caller }) func getTasksByCompletionStatus(completed : Bool) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view tasks");
    };

    let allTasks = Iter.toArray(natMap.vals(tasks));
    let userTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      allTasks;
    } else {
      Array.filter<Task>(allTasks, func(task) { Principal.equal(task.owner, caller) });
    };

    Array.filter<Task>(userTasks, func(task) { task.completed == completed });
  };

  public query ({ caller }) func getCompletedTasksHistory(searchTerm : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view task history");
    };

    let allTasks = Iter.toArray(natMap.vals(tasks));
    let userTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      allTasks;
    } else {
      Array.filter<Task>(allTasks, func(task) { Principal.equal(task.owner, caller) });
    };

    let completedTasks = Array.filter<Task>(userTasks, func(task) { task.completed });

    if (Text.size(searchTerm) == 0) {
      completedTasks;
    } else {
      Array.filter<Task>(
        completedTasks,
        func(task) {
          Text.contains(Text.toLowercase(task.title), #text(Text.toLowercase(searchTerm)));
        },
      );
    };
  };

  public shared ({ caller }) func saveUserPreferences(preferences : UserPreferences) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save preferences");
    };

    userPreferences := principalMap.put(userPreferences, caller, preferences);
  };

  public query ({ caller }) func getUserPreferences() : async ?UserPreferences {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view preferences");
    };

    principalMap.get(userPreferences, caller);
  };

  public query ({ caller }) func getOverviewData() : async OverviewData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view overview data");
    };

    let allProjects = Iter.toArray(natMap.vals(projects));
    let allTasks = Iter.toArray(natMap.vals(tasks));

    let userProjects = if (AccessControl.isAdmin(accessControlState, caller)) {
      allProjects;
    } else {
      Array.filter<Project>(allProjects, func(project) { Principal.equal(project.owner, caller) });
    };

    let userTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      allTasks;
    } else {
      Array.filter<Task>(allTasks, func(task) { Principal.equal(task.owner, caller) });
    };

    let now = Time.now();
    let weekStart = now - (7 * 24 * 60 * 60 * 1000000000);
    let monthStart = now - (30 * 24 * 60 * 60 * 1000000000);
    let yearStart = now - (365 * 24 * 60 * 60 * 1000000000);

    let weeklyTasks = Array.filter<Task>(userTasks, func(task) { task.dueDate >= weekStart });
    let monthlyTasks = Array.filter<Task>(userTasks, func(task) { task.dueDate >= monthStart });
    let yearlyTasks = Array.filter<Task>(userTasks, func(task) { task.dueDate >= yearStart });

    let weeklyCompleted = Array.filter<Task>(weeklyTasks, func(task) { task.completed });
    let monthlyCompleted = Array.filter<Task>(monthlyTasks, func(task) { task.completed });
    let yearlyCompleted = Array.filter<Task>(yearlyTasks, func(task) { task.completed });

    let weeklyStats : TimePeriodStats = {
      period = "week";
      totalTasks = weeklyTasks.size();
      completedTasks = weeklyCompleted.size();
      pendingTasks = weeklyTasks.size() - weeklyCompleted.size();
      completionRate = if (weeklyTasks.size() > 0) {
        Float.fromInt(weeklyCompleted.size()) / Float.fromInt(weeklyTasks.size());
      } else { 0.0 };
    };

    let monthlyStats : TimePeriodStats = {
      period = "month";
      totalTasks = monthlyTasks.size();
      completedTasks = monthlyCompleted.size();
      pendingTasks = monthlyTasks.size() - monthlyCompleted.size();
      completionRate = if (monthlyTasks.size() > 0) {
        Float.fromInt(monthlyCompleted.size()) / Float.fromInt(monthlyTasks.size());
      } else { 0.0 };
    };

    let yearlyStats : TimePeriodStats = {
      period = "year";
      totalTasks = yearlyTasks.size();
      completedTasks = yearlyCompleted.size();
      pendingTasks = yearlyTasks.size() - yearlyCompleted.size();
      completionRate = if (yearlyTasks.size() > 0) {
        Float.fromInt(yearlyCompleted.size()) / Float.fromInt(yearlyTasks.size());
      } else { 0.0 };
    };

    let projectStats = Array.map<Project, ProjectStats>(
      userProjects,
      func(project) {
        let projectTasks = Array.filter<Task>(userTasks, func(task) { task.projectId == ?project.id });
        let completedTasks = Array.filter<Task>(projectTasks, func(task) { task.completed });
        let overdueTasks = Array.filter<Task>(projectTasks, func(task) { not task.completed and task.dueDate < now });

        {
          projectId = project.id;
          totalTasks = projectTasks.size();
          completedTasks = completedTasks.size();
          overdueTasks = overdueTasks.size();
          completionRate = if (projectTasks.size() > 0) {
            Float.fromInt(completedTasks.size()) / Float.fromInt(projectTasks.size());
          } else { 0.0 };
          overdueRate = if (projectTasks.size() > 0) {
            Float.fromInt(overdueTasks.size()) / Float.fromInt(projectTasks.size());
          } else { 0.0 };
        };
      },
    );

    let mostProductiveDay = if (userTasks.size() > 0) {
      ?userTasks[0].createdAt;
    } else { null };

    let longestStreak = 0;
    let mostActiveProject = if (userProjects.size() > 0) {
      ?userProjects[0].id;
    } else { null };

    let productivityInsights : ProductivityInsights = {
      mostProductiveDay;
      longestStreak;
      mostActiveProject;
    };

    {
      totalTasks = userTasks.size();
      totalProjects = userProjects.size();
      weeklyStats;
      monthlyStats;
      yearlyStats;
      projectStats;
      productivityInsights;
    };
  };
};
