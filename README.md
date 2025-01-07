# Employee Management System
A command-line application built using TypeScript and PostgreSQL to manage employees, roles, and departments in a company. This application allows users to view, add, and update employee records in a structured database.

## **Features**
- View all departments, roles, and employees in a formatted table.
- Add new departments, roles, and employees.
- Update an employee's role.
- Hierarchical employee structure with managers.

---

## **Setup and Installation**

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Company-SQL-Viewer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up the Database
Start PostgreSQL Server.

Create the Database: Run the provided SQL schema (schema.sql) to set up the database structure.

```bash
psql -U postgres -f db/schema.sql
```

### 4. Compile TypeScript
Compile the TypeScript code to JavaScript:
```
npx tsc
```
### 5. Run the Application
Run the application:

```bash
node index.js
```
## **Usage**
Upon starting the application, you'll see a menu like this:

```sql
? What would you like to do? (Use arrow keys)
❯ View All Departments
  View All Roles
  View All Employees
  Add a Department
  Add a Role
  Add an Employee
  Update an Employee Role
  Exit
```
Select an option using the arrow keys and follow the prompts.
### Examples:

- View All Employees: Displays a formatted table of all employees, including their roles, salaries, departments, and managers.
- Add a Role: Prompts for the role name, salary, and department, and adds the new role to the database.
- Update an Employee Role: Allows updating an employee's role by selecting the employee and assigning a new role.
## **Dependencies**
- TypeScript - For type-safe JavaScript development.
- pg - PostgreSQL client for Node.js.
- inquirer - For interactive command-line prompts.
## **License**
This project is licensed under the MIT License. See the LICENSE file for details.