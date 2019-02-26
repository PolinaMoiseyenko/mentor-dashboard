const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");

const mentorStudentsPairs = XLSX.readFile("./data/MentorStudentsPairs.xlsx");
const mentors = mentorStudentsPairs.Sheets['second_name-to_github_account'];
const students = mentorStudentsPairs.Sheets['pairs'];
const score = XLSX.readFile("./data/MentorScore.xlsx").Sheets['Form Responses 1'];
const tasks = XLSX.readFile("./data/Tasks.xlsx").Sheets['Sheet1'];



// GET MENTORS 

const getMentor = (sheet, currentRow) => {
  const fieldMapping = {
    name: "A",
    surname: "B",
    github: "E"
  };
  const mentor = {
    name: sheet[fieldMapping.name + currentRow].v,
    surname: sheet[fieldMapping.surname + currentRow].v,
    github: sheet[fieldMapping.github + currentRow].v.toLowerCase(),
    fullname: `${sheet[fieldMapping.name + currentRow].v} ${sheet[fieldMapping.surname + currentRow].v}`,
    key: `${sheet[fieldMapping.name + currentRow].v} ${sheet[fieldMapping.surname + currentRow].v}` 
  };

  return mentor;
};

const getMentors = (sheet) => {
  const mentors = [];
  const length = XLSX.utils.decode_range(sheet['!ref']).e.r;
  for (let i = 2; i < length - 2; i += 1) {
    mentors.push(getMentor(sheet, i));
  }

  return mentors;
};

// GET STUDENTS TO MENTORS

const getStudentsToMentors = (sheet, mentors) => {
  const mentorsArray = getMentors(mentors);
  const fieldMapping = {
    mentorName: 'A',
    studentGithub: 'B'
  };
  const length = XLSX.utils.decode_range(sheet['!ref']).e.r;
  for (let i = 2; i < length - 4; i += 1) {
    const mentorObj = mentorsArray.find(item => item.fullname === sheet[fieldMapping.mentorName + i].v);
    const hasStudArrayProp = Object.prototype.hasOwnProperty.call(mentorObj, 'studentsArray');
    if (!hasStudArrayProp) {
      mentorObj.studentsArray = [];
    }
    mentorObj.studentsArray.push({
      studentName: sheet[fieldMapping.studentGithub + i].v,
      studentGithub: `https://github.com/${sheet[fieldMapping.studentGithub + i].v}`,
      key: sheet[fieldMapping.studentGithub + i].v
    });
  }
  return mentorsArray;
};

getStudentsToMentors(students, mentors);

// GET TASKS TO STUDENTS

const getTaskstoStudents = (sheet, students, mentors) => {
  studentsToMentors = getStudentsToMentors(students, mentors);
  fieldMapping = {
    mentorGithub: 'B',
    studentGithub: 'C',
    taskName: 'D'
  };
  const length = XLSX.utils.decode_range(sheet['!ref']).e.r;
  for (let i = 2; i <= length; i += 1) {
    if (sheet[`B${i}`]) {
      const mentorObj = studentsToMentors.find(item => item.github === sheet[fieldMapping.mentorGithub + i].v.toLowerCase().trim());
      if (mentorObj) {
        const studentObj = mentorObj.studentsArray.find(item => item.studentGithub === sheet[fieldMapping.studentGithub + i].v.toLowerCase().trim());
        if (studentObj) {
          const hasDoneTasksProp = Object.prototype.hasOwnProperty.call(studentObj, 'doneTasks');
          if (!hasDoneTasksProp) {
            studentObj.doneTasks = [];
          }          
          const taskName = sheet[fieldMapping.taskName + i].v;                    
          studentObj.doneTasks.push(taskName);
        }
      }
    }
  }
  return studentsToMentors;
}

// GET LIST OF TASKS

const getTasks = (sheet) => {
  const tasks = [];
  const fieldMapping = {
    taskName: 'A',
    link: 'B',
    status: 'C',
  };
  const length = XLSX.utils.decode_range(sheet['!ref']).e.r;
  
  for (let i = 2; i < length + 2; i += 1) {
    if (sheet[fieldMapping.link + i]) {
        tasks.push({
          key: sheet[fieldMapping.taskName + i].v.trim(),
          name: sheet[fieldMapping.taskName + i].v.trim(),
          link: sheet[fieldMapping.link + i].v,
          status: sheet[fieldMapping.status + i].v,
        });
      } else {
        tasks.push({
          key: sheet[fieldMapping.taskName + i].v.trim(),
          name: sheet[fieldMapping.taskName + i].v.trim(),
          link: '',
          status: sheet[fieldMapping.status + i].v,
        });
      }    
  }
  return tasks;
}

// GENERATE JSON WITH DATA

const dataDir = fs.existsSync(path.resolve(__dirname, './json-data'));
if(!dataDir) {
  fs.mkdirSync(path.resolve(__dirname, './json-data'));
}

const tasksList = JSON.stringify(getTasks(tasks), 0, 2);
const mentorData = JSON.stringify(getTaskstoStudents(score, students, mentors), 0, 2);
fs.writeFile("./json-data/tasks.json", tasksList, 'utf8', () => {
  console.log("writing is done!");
});
fs.writeFile("./json-data/mentorData.json", mentorData, 'utf8', () => {
  console.log("writing is done!");
});