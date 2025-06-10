// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getUserIds } from "./common.mjs";

// This function adds user options to the dropdown menu
function populateUserDropdown() {
  const userSelect = document.getElementById("user-select"); 
  const users = getUserIds();  // Get the list of user IDs (it's an array)

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a user";
  userSelect.appendChild(defaultOption);

  // Loop through the user IDs and create an <option> for each
  users.forEach((userId) => {
    const option = document.createElement("option");
    option.value = userId;
    option.textContent = `User ${userId}`;
    userSelect.appendChild(option);
  });
}

populateUserDropdown();

const addTopicForm = document.getElementById("add-topic");
const topicNameInput = document.getElementById("topic-name");
const dateInput = document.getElementById("start-date");

// Sets the date input's value to today's date
function setDefaultDate() {
   dateInput.valueAsDate = new Date();
}

function handleTopicSubmit(event) {
 event.preventDefault();

 const topicName = topicNameInput.value.trim(); // .trim() removes whitespace from the topic name
 const startDate = dateInput.value;

 if (!topicName || !startDate) {
   alert("Please enter both topic name and start date.");
   return;
 }

 addTopicForm.reset();
 setDefaultDate();
}

setDefaultDate();

// This ensures the function runs when the user either clicks the submit button or presses the Enter key.
addTopicForm.addEventListener("submit", handleTopicSubmit);

export { populateUserDropdown };
