import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Course = {
    id : Text;
    title : Text;
    room : Text;
    date : Text;
    startTime : Text;
    endTime : Text;
    category : Text;
    capacity : Nat;
    enrolledCount : Nat;
    isMandatory : Bool;
  };

  type Registration = {
    id : Text;
    employeeId : Text;
    email : Text;
    courseIds : [Text];
    submittedAt : Int;
  };

  public type UserProfile = {
    name : Text;
    employeeId : Text;
    email : Text;
  };

  var adminAssigned = false;

  let courses = Map.empty<Text, Course>();
  let registrations = Map.empty<Text, Registration>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public shared ({ caller }) func selfGrantAdmin(secret : Text) : async Bool {
    if (secret != "APACVKOM2026ADMIN") { return false };
    if (not caller.isAnonymous()) {
      accessControlState.userRoles.add(caller, #admin);
      adminAssigned := true;
    };
    true;
  };

  public shared ({ caller }) func claimPreAuthorizedAdmin() : async Bool {
    let preAuthorizedAdmins : [Text] = [
      "7vnp3-r5obz-dzsyu-o6bgq-berzm-ytx3o-cbohj-4ezkx-ada57-yj3cn-cae",
      "jspcx-xbxvl-7geyf-ysdzv-kg5ya-dvwz2-lis3i-6s7wp-i2ciw-lg6pf-tqe",
    ];
    let callerText = caller.toText();
    let isPreAuthorized = preAuthorizedAdmins.any(
      func(admin) { admin == callerText }
    );
    if (isPreAuthorized and not caller.isAnonymous()) {
      accessControlState.userRoles.add(caller, #admin);
      adminAssigned := true;
      return true;
    };
    false;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func grantAdminBypass() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can grant admin privileges");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public shared ({ caller }) func resetAndGrantAdmin() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reset admin assignment");
    };
    adminAssigned := false;
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public shared ({ caller }) func initializeCourses() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can initialize courses");
    };

    let initialCourses = [
      {
        id = "c00";
        title = "Kickoff, Keynote and Management Presentations";
        room = "ICC";
        date = "2026-03-06";
        startTime = "09:30";
        endTime = "13:00";
        category = "Breakout";
        capacity = 9999;
        enrolledCount = 0;
        isMandatory = true;
      },
      {
        id = "c01";
        title = "Cloud Extensions";
        room = "ICC";
        date = "2026-03-06";
        startTime = "14:30";
        endTime = "15:30";
        category = "Breakout";
        capacity = 9999;
        enrolledCount = 0;
        isMandatory = true;
      },
      {
        id = "c02";
        title = "SAP S/4 Migration/Readiness with Vistex V/4";
        room = "ICC";
        date = "2026-03-06";
        startTime = "15:30";
        endTime = "16:30";
        category = "Panel Discussion";
        capacity = 300;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c03";
        title = "Industry Panel Discussion: CPG - Food Services";
        room = "IRIS 1";
        date = "2026-03-06";
        startTime = "15:30";
        endTime = "16:30";
        category = "Panel Discussion";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c04";
        title = "Industry Panel Discussion: Life Sciences";
        room = "IRIS 2";
        date = "2026-03-06";
        startTime = "15:30";
        endTime = "16:30";
        category = "Panel Discussion";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c05";
        title = "Industry Panel Discussion: Wholesale distribution";
        room = "IRIS 1";
        date = "2026-03-07";
        startTime = "13:00";
        endTime = "14:00";
        category = "Panel Discussion";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c06";
        title = "Industry Trend and Product Roadmap: Consumer Products";
        room = "IRIS 1";
        date = "2026-03-07";
        startTime = "14:00";
        endTime = "15:00";
        category = "Panel Discussion";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c07";
        title = "Retroactive Pricing for Automotive Industry";
        room = "IRIS 1";
        date = "2026-03-07";
        startTime = "15:00";
        endTime = "16:00";
        category = "Panel Discussion";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c08";
        title = "Vistex Price Retroactive and Claims Processing";
        room = "IRIS 1";
        date = "2026-03-07";
        startTime = "16:00";
        endTime = "17:00";
        category = "Solution Overview";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c09";
        title = "Vistex Pricing with Price Review";
        room = "IRIS 2";
        date = "2026-03-07";
        startTime = "13:00";
        endTime = "14:00";
        category = "Solution Overview";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c10";
        title = "Agile Project Methodology for APAC region";
        room = "IRIS 2";
        date = "2026-03-07";
        startTime = "14:00";
        endTime = "15:00";
        category = "Solution Overview";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c11";
        title = "RevFlo for Vistex Applications Vistex TPM";
        room = "IRIS 2";
        date = "2026-03-07";
        startTime = "15:00";
        endTime = "16:00";
        category = "Solution Overview";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c12";
        title = "Agri Farm and Grower Management";
        room = "IRIS 2";
        date = "2026-03-07";
        startTime = "16:00";
        endTime = "17:00";
        category = "Solution Overview";
        capacity = 100;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c13";
        title = "Vistex Vendor Chargebacks";
        room = "IRIS 3";
        date = "2026-03-07";
        startTime = "14:00";
        endTime = "15:00";
        category = "Solution Overview";
        capacity = 200;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c14";
        title = "Vistex Rebates";
        room = "IRIS 3";
        date = "2026-03-07";
        startTime = "15:00";
        endTime = "16:00";
        category = "Solution Overview";
        capacity = 200;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c15";
        title = "Vistex TPM / Planning Solutions";
        room = "IRIS 3";
        date = "2026-03-07";
        startTime = "16:00";
        endTime = "17:00";
        category = "Solution Overview";
        capacity = 200;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "c16";
        title = "Next Gen ABAP (new ABAP syntaxes)";
        room = "IRIS 3";
        date = "2026-03-07";
        startTime = "13:00";
        endTime = "14:00";
        category = "Breakout";
        capacity = 200;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s101";
        title = "Business AI Data Flow";
        room = "Booth 1";
        date = "2026-03-07";
        startTime = "13:00";
        endTime = "13:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s102";
        title = "ETM (Solution)";
        room = "Booth 1";
        date = "2026-03-07";
        startTime = "13:30";
        endTime = "14:00";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s103";
        title = "Business AI Data Flow";
        room = "Booth 1";
        date = "2026-03-07";
        startTime = "14:00";
        endTime = "14:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s104";
        title = "ViZi Self Service / Policies (AI)";
        room = "Booth 1";
        date = "2026-03-07";
        startTime = "15:00";
        endTime = "15:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s105";
        title = "Business AI Data Flow";
        room = "Booth 1";
        date = "2026-03-07";
        startTime = "15:30";
        endTime = "16:00";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s106";
        title = "ETM (Solution)";
        room = "Booth 1";
        date = "2026-03-07";
        startTime = "16:00";
        endTime = "16:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s107";
        title = "Business AI Data Flow";
        room = "Booth 1";
        date = "2026-03-07";
        startTime = "16:30";
        endTime = "17:00";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s201";
        title = "Business AI - Assistant";
        room = "Booth 2";
        date = "2026-03-07";
        startTime = "13:00";
        endTime = "13:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s202";
        title = "Portals";
        room = "Booth 2";
        date = "2026-03-07";
        startTime = "13:30";
        endTime = "14:00";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s203";
        title = "Business AI - Assistant";
        room = "Booth 2";
        date = "2026-03-07";
        startTime = "14:00";
        endTime = "14:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s204";
        title = "Business AI - Assistant";
        room = "Booth 2";
        date = "2026-03-07";
        startTime = "15:00";
        endTime = "15:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s205";
        title = "Portals";
        room = "Booth 2";
        date = "2026-03-07";
        startTime = "15:30";
        endTime = "16:00";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s206";
        title = "ViZi Self Service / Policies (AI)";
        room = "Booth 2";
        date = "2026-03-07";
        startTime = "16:00";
        endTime = "16:30";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      },
      {
        id = "s207";
        title = "Business AI - Assistant";
        room = "Booth 2";
        date = "2026-03-07";
        startTime = "16:30";
        endTime = "17:00";
        category = "Short Talk";
        capacity = 50;
        enrolledCount = 0;
        isMandatory = false;
      }
    ];
    courses.clear();
    initialCourses.forEach(
      func(course) {
        courses.add(course.id, course);
      }
    );
  };

  public query ({ caller }) func getCourses() : async [Course] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view courses");
    };
    courses.values().toArray();
  };

  public shared ({ caller }) func register(employeeId : Text, email : Text, courseIds : [Text]) : async {
    #ok;
    #error : Text;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register for courses");
    };

    let registrationId = employeeId # "_" # email;
    switch (registrations.get(registrationId)) {
      case (?_) {
        return #error("Already registered");
      };
      case (null) { () };
    };

    for (courseId in courseIds.values()) {
      switch (courses.get(courseId)) {
        case (?course) {
          if (not course.isMandatory and course.enrolledCount >= course.capacity) {
            return #error("Course " # course.title # " is full");
          };
        };
        case (null) {
          return #error("Course not found: " # courseId);
        };
      };
    };

    let newRegistration : Registration = {
      id = registrationId;
      employeeId;
      email;
      courseIds;
      submittedAt = Time.now();
    };
    registrations.add(registrationId, newRegistration);

    for (courseId in courseIds.values()) {
      switch (courses.get(courseId)) {
        case (?course) {
          let updatedCourse = {
            id = course.id;
            title = course.title;
            room = course.room;
            date = course.date;
            startTime = course.startTime;
            endTime = course.endTime;
            category = course.category;
            capacity = course.capacity;
            enrolledCount = course.enrolledCount + 1;
            isMandatory = course.isMandatory;
          };
          courses.add(courseId, updatedCourse);
        };
        case (null) {};
      };
    };

    #ok;
  };

  public query ({ caller }) func getRegistrations() : async [Registration] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all registrations");
    };
    registrations.values().toArray();
  };

  public query ({ caller }) func getRegistrationsCsv() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can export registrations");
    };

    var csv = "EmployeeID,Email,CourseIDs,CourseNames,SubmittedAt\n";
    for (registration in registrations.values()) {
      let courseIdsText = registration.courseIds.values().join(",");
      var courseNames = "";
      for (courseId in registration.courseIds.vals()) {
        switch (courses.get(courseId)) {
          case (?course) {
            if (courseNames == "") {
              courseNames := course.title;
            } else {
              courseNames := courseNames # "," # course.title;
            };
          };
          case (null) {};
        };
      };
      csv := csv # registration.employeeId # "," # registration.email # "," # courseIdsText # "," # courseNames # "," # registration.submittedAt.toText() # "\n";
    };
    csv;
  };

  public type AdminStats = {
    totalRegistrations : Nat;
    courseStats : [(Text, Text, Nat, Nat)];
  };

  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view statistics");
    };

    let totalRegistrations = registrations.size();
    var courseStats : [(Text, Text, Nat, Nat)] = [];
    for (course in courses.values()) {
      courseStats := courseStats.concat([(course.id, course.title, course.enrolledCount, course.capacity)]);
    };

    {
      totalRegistrations;
      courseStats;
    };
  };
};
