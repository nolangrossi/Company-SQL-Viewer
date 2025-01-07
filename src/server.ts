import inquirer from 'inquirer';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({
    host: 'localhost',
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: 5432, 
});


client.connect((err) => {
    if (err) throw err;
    console.log('Connected to the PostgreSQL database.');
    mainMenu();
});


function displayTable(data: any[], columns: string[]): void {
    const columnWidths = columns.map((col) =>
        Math.max(...data.map((row) => (row[col] ? row[col].toString().length : 0)), col.length)
    );

    // Display header
    console.log(columns.map((col, i) => col.padEnd(columnWidths[i])).join(' | '));
    console.log('-'.repeat(columnWidths.reduce((sum, width) => sum + width + 3, -3)));

    // Display rows
    data.forEach((row) => {
        console.log(
            columns.map((col, i) => (row[col] ? row[col].toString() : '').padEnd(columnWidths[i])).join(' | ')
        );
    });
}

function mainMenu(): void {
    inquirer
        .prompt({
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role',
                'Exit',
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                case 'View All Roles':
                    viewAllRoles();
                    break;
                case 'View All Employees':
                    viewAllEmployees();
                    break;
                case 'Add a Department':
                    addDepartment();
                    break;
                case 'Add a Role':
                    addRole();
                    break;
                case 'Add an Employee':
                    addEmployee();
                    break;
                case 'Update an Employee Role':
                    updateEmployeeRole();
                    break;
                case 'Exit':
                    client.end();
                    break;
            }
        });
}


function viewAllDepartments(): void {
    client.query('SELECT * FROM departments', (err, res) => {
        if (err) throw err;
        displayTable(res.rows, ['id', 'name']);
        mainMenu();
    });
}


function viewAllRoles(): void {
    const query = `
        SELECT roles.id, roles.title, departments.name AS department, roles.salary
        FROM roles
        LEFT JOIN departments ON roles.department_id = departments.id
    `;
    client.query(query, (err, res) => {
        if (err) throw err;
        displayTable(res.rows, ['id', 'title', 'department', 'salary']);
        mainMenu();
    });
}


function viewAllEmployees(): void {
    const query = `
        SELECT e.id, e.first_name, e.last_name, roles.title, departments.name AS department, roles.salary,
        CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employees e
        LEFT JOIN roles ON e.role_id = roles.id
        LEFT JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees m ON e.manager_id = m.id
    `;
    client.query(query, (err, res) => {
        if (err) throw err;
        displayTable(res.rows, ['id', 'first_name', 'last_name', 'title', 'department', 'salary', 'manager']);
        mainMenu();
    });
}

function addDepartment(): void {
    inquirer
        .prompt({
            type: 'input',
            name: 'department_name',
            message: 'Enter the name of the department:',
        })
        .then((answer) => {
            const query = 'INSERT INTO departments (name) VALUES ($1)';
            const values = [answer.department_name];

            client.query(query, values, (err) => {
                if (err) {
                    console.error('Error adding department:', err);
                    return;
                }
                console.log('Department added successfully!');
                mainMenu();
            });
        })
        .catch((error) => {
            console.error('Error during prompt:', error);
        });
}

function addRole(): void {
    client.query('SELECT * FROM departments', (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Enter the name of the role:',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Enter the salary for the role:',
                },
                {
                    type: 'list',
                    name: 'department_id',
                    message: 'Select the department for the role:',
                    choices: res.rows.map((department: any) => ({
                        name: department.name,
                        value: department.id,
                    })),
                },
            ])
            .then((answers) => {
                client.query(
                    'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
                    [answers.title, answers.salary, answers.department_id],
                    (err) => {
                        if (err) throw err;
                        console.log('Role added successfully!');
                        mainMenu();
                    }
                );
            });
    });
}

function addEmployee(): void {
    client.query('SELECT * FROM roles', (err, rolesRes) => {
        if (err) throw err;
        client.query('SELECT * FROM employees', (err, employeesRes) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: "Enter the employee's first name:",
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: "Enter the employee's last name:",
                    },
                    {
                        type: 'list',
                        name: 'role_id',
                        message: "Select the employee's role:",
                        choices: rolesRes.rows.map((role: any) => ({
                            name: role.title,
                            value: role.id,
                        })),
                    },
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: "Select the employee's manager:",
                        choices: [{ name: 'None', value: null }].concat(
                            employeesRes.rows.map((employee: any) => ({
                                name: `${employee.first_name} ${employee.last_name}`,
                                value: employee.id,
                            }))
                        ),
                    },
                ])
                .then((answers) => {
                    client.query(
                        'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                        [
                            answers.first_name,
                            answers.last_name,
                            answers.role_id,
                            answers.manager_id,
                        ],
                        (err) => {
                            if (err) throw err;
                            console.log('Employee added successfully!');
                            mainMenu();
                        }
                    );
                });
        });
    });
}

function updateEmployeeRole(): void {
    client.query('SELECT * FROM employees', (err, employeesRes) => {
        if (err) throw err;
        client.query('SELECT * FROM roles', (err, rolesRes) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'employee_id',
                        message: 'Select the employee to update:',
                        choices: employeesRes.rows.map((employee: any) => ({
                            name: `${employee.first_name} ${employee.last_name}`,
                            value: employee.id,
                        })),
                    },
                    {
                        type: 'list',
                        name: 'role_id',
                        message: 'Select the new role:',
                        choices: rolesRes.rows.map((role: any) => ({
                            name: role.title,
                            value: role.id,
                        })),
                    },
                ])
                .then((answers) => {
                    client.query(
                        'UPDATE employees SET role_id = $1 WHERE id = $2',
                        [answers.role_id, answers.employee_id],
                        (err) => {
                            if (err) throw err;
                            console.log('Employee role updated successfully!');
                            mainMenu();
                        }
                    );
                });
        });
    });
}
