// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getUserIds } from "./common.mjs";
import { getData } from "./storage.mjs";  

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

// Display user data in table or show message if no data
function getUserInfo (userId){
  const noDataMsg = document.getElementById("NoData");
  const table = document.getElementById("userData");
  const tbody = document.getElementById("userInfo");

  //clear previous data

  tbody.innerHTML = "";

  // if user data is not select no table and message 
  if (!userId){
    table.style.display = "none";
    noDataMsg.style.display = "none";
    return;
  }

  const userData = getData(userId);

  if (userData !==null && userData.length >0)
  {
    noDataMsg.style.display = "none";
    table.style.display = "table";

    //populate table rows
    userData.forEach((item,index) => {
      const row = document.createElement("tr");
      row.innerHTML = 
                      `<td>${index +1}</td>
                      <td>${item.topic}</td>
                      <td>${item.date}</td>
                      <td>
                        <button class="delete-btn">Delete</button>
                      </td>`;

        const deleteBtn = row.querySelector(".delete-btn");
        deleteBtn.addEventListener("click",() =>{
          row.remove();
        });

          tbody.appendChild(row);
    }

  );
  table.style.display = "table";
  noDataMsg.style.display ="none";
  
  }
  else 
  {
    table.style.display = "none";
    noDataMsg.style.display = "block";
    noDataMsg.textContent = "No agenda available"
  }

}

populateUserDropdown();

export { populateUserDropdown,getUserInfo };
