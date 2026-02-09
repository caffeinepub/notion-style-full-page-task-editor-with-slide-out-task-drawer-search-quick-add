import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

module {
  type OldTask = {
    id : Nat;
    title : Text;
    description : ?Text;
    longFormContent : ?Text;
    dueDate : Time.Time;
    completed : Bool;
    projectId : Nat;
    createdAt : Time.Time;
    owner : Principal;
    completionDate : ?Time.Time;
    priority : Text;
  };

  type OldActor = {
    nextProjectId : Nat;
    nextTaskId : Nat;
    projects : OrderedMap.Map<Nat, { id : Nat; name : Text; color : Text; icon : Text; createdAt : Time.Time; owner : Principal }>;
    tasks : OrderedMap.Map<Nat, OldTask>;
    userPreferences : OrderedMap.Map<Principal, { themeMode : Text; defaultView : Text }>;
    userProfiles : OrderedMap.Map<Principal, { name : Text }>;
  };

  type NewTask = {
    id : Nat;
    title : Text;
    description : ?Text;
    longFormContent : ?Text;
    dueDate : Time.Time;
    completed : Bool;
    projectId : ?Nat;
    createdAt : Time.Time;
    owner : Principal;
    completionDate : ?Time.Time;
    priority : Text;
  };

  type NewActor = {
    nextProjectId : Nat;
    nextTaskId : Nat;
    projects : OrderedMap.Map<Nat, { id : Nat; name : Text; color : Text; icon : Text; createdAt : Time.Time; owner : Principal }>;
    tasks : OrderedMap.Map<Nat, NewTask>;
    userPreferences : OrderedMap.Map<Principal, { themeMode : Text; defaultView : Text }>;
    userProfiles : OrderedMap.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let natMap = OrderedMap.Make<Nat>(Nat.compare);

    let tasks = natMap.map<OldTask, NewTask>(
      old.tasks,
      func(_id, oldTask) {
        {
          oldTask with
          projectId = ?oldTask.projectId;
        };
      },
    );

    {
      nextProjectId = old.nextProjectId;
      nextTaskId = old.nextTaskId;
      projects = old.projects;
      tasks;
      userPreferences = old.userPreferences;
      userProfiles = old.userProfiles;
    };
  };
};
