import pool from './src/config/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting seed process...');
    await client.query('BEGIN');
    
    console.log('Truncating tables...');
    await client.query('TRUNCATE departments, positions, employees, users, attendance, leave_requests, payroll, performance_reviews, announcements, okr_cycles, goals, key_results, notifications CASCADE');

    // 1. Departments
    console.log('Seeding departments...');
    const depts = [
      ['Engineering', 'Core software development and infrastructure'],
      ['Product & Design', 'Product management and UI/UX design'],
      ['Sales & Marketing', 'Growth, marketing, and enterprise sales'],
      ['Human Resources', 'People ops, recruitment, and culture'],
      ['Finance & Operations', 'Accounting, legal, and company operations']
    ];
    
    const deptMap = {};
    for (const [name, desc] of depts) {
      const res = await client.query(
        `INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING id`,
        [name, desc]
      );
      deptMap[name] = res.rows[0].id;
    }

    // 2. Positions
    console.log('Seeding positions...');
    
    const positionConfigs = [
      { title: 'VP of Engineering', dept: 'Engineering', level: 'Executive' },
      { title: 'Senior Backend Engineer', dept: 'Engineering', level: 'Senior' },
      { title: 'Frontend Developer', dept: 'Engineering', level: 'Mid' },
      { title: 'DevOps Engineer', dept: 'Engineering', level: 'Mid' },
      { title: 'Product Manager', dept: 'Product & Design', level: 'Senior' },
      { title: 'UX Designer', dept: 'Product & Design', level: 'Mid' },
      { title: 'HR Director', dept: 'Human Resources', level: 'Senior' },
      { title: 'Talent Acquisition', dept: 'Human Resources', level: 'Mid' },
      { title: 'Marketing Manager', dept: 'Sales & Marketing', level: 'Senior' },
      { title: 'Sales Representative', dept: 'Sales & Marketing', level: 'Mid' },
      { title: 'Financial Analyst', dept: 'Finance & Operations', level: 'Mid' }
    ];

    const posMap = {};
    for (const pos of positionConfigs) {
      const res = await client.query(
        `INSERT INTO positions (title, department_id, level) VALUES ($1, $2, $3) RETURNING id`,
        [pos.title, deptMap[pos.dept], pos.level]
      );
      posMap[pos.title] = res.rows[0].id;
    }

    // 3. Admin/HR User (hr@hrflow.com)
    console.log('Seeding HR Admin...');
    const hrEmpCode = 'EM-100001';
    const hrEmpRes = await client.query(
      `INSERT INTO employees (first_name, last_name, email, phone, employee_code, hire_date, status, contract_type, salary, department_id, position_id, address)
       VALUES ('Sarah', 'Ahmed', 'hr@hrflow.com', '+92 300 1234567', $1, '2021-06-01', 'active', 'full-time', 150000, $2, $3, 'DHA Phase 6, Karachi')
       RETURNING id`,
      [hrEmpCode, deptMap['Human Resources'], posMap['HR Director']]
    );
    const hrEmpId = hrEmpRes.rows[0].id;
    
    const hashedHrPass = await bcrypt.hash('admin123', 10);
    const hrUserRes = await client.query(
      `INSERT INTO users (email, password, role, employee_id) VALUES ($1, $2, 'hr', $3) RETURNING id`,
      ['hr@hrflow.com', hashedHrPass, hrEmpId]
    );
    const hrUserId = hrUserRes.rows[0].id;

    // 4. Standard Employee User (employee@hrflow.com)
    console.log('Seeding Standard Employee...');
    const empCode = 'EM-100002';
    const empRes = await client.query(
      `INSERT INTO employees (first_name, last_name, email, phone, employee_code, hire_date, status, contract_type, salary, department_id, position_id, address)
       VALUES ('Ali', 'Raza', 'employee@hrflow.com', '+92 333 9876543', $1, '2022-03-15', 'active', 'full-time', 120000, $2, $3, 'Gulshan-e-Iqbal, Karachi')
       RETURNING id`,
      [empCode, deptMap['Engineering'], posMap['Frontend Developer']]
    );
    const aliEmpId = empRes.rows[0].id;
    
    const hashedEmpPass = await bcrypt.hash('emp123', 10);
    const aliUserRes = await client.query(
      `INSERT INTO users (email, password, role, employee_id) VALUES ($1, $2, 'employee', $3) RETURNING id`,
      ['employee@hrflow.com', hashedEmpPass, aliEmpId]
    );
    const aliUserId = aliUserRes.rows[0].id;

    // 5. Additional Realistic Employees
    console.log('Seeding additional employees...');
    const additionalEmployees = [
      { fn: 'Zainab', ln: 'Tariq', email: 'zainab.t@hrflow.com', phone: '+92 321 1112222', dept: 'Engineering', pos: 'Senior Backend Engineer', type: 'full-time', salary: 180000, hire: '2020-11-10' },
      { fn: 'Usman', ln: 'Khan', email: 'usman.k@hrflow.com', phone: '+92 300 4445555', dept: 'Engineering', pos: 'VP of Engineering', type: 'full-time', salary: 350000, hire: '2019-02-01' },
      { fn: 'Ayesha', ln: 'Malik', email: 'ayesha.m@hrflow.com', phone: '+92 333 6667777', dept: 'Product & Design', pos: 'Product Manager', type: 'full-time', salary: 160000, hire: '2021-08-20' },
      { fn: 'Bilal', ln: 'Hassan', email: 'bilal.h@hrflow.com', phone: '+92 301 8889999', dept: 'Product & Design', pos: 'UX Designer', type: 'contract', salary: 110000, hire: '2023-01-05' },
      { fn: 'Fatima', ln: 'Shah', email: 'fatima.s@hrflow.com', phone: '+92 345 2223333', dept: 'Sales & Marketing', pos: 'Marketing Manager', type: 'full-time', salary: 140000, hire: '2022-05-12' },
      { fn: 'Omar', ln: 'Farooq', email: 'omar.f@hrflow.com', phone: '+92 322 5556666', dept: 'Sales & Marketing', pos: 'Sales Representative', type: 'full-time', salary: 80000, hire: '2023-06-01' },
      { fn: 'Sana', ln: 'Iqbal', email: 'sana.i@hrflow.com', phone: '+92 302 7778888', dept: 'Human Resources', pos: 'Talent Acquisition', type: 'full-time', salary: 90000, hire: '2023-03-15' },
      { fn: 'Hamza', ln: 'Javed', email: 'hamza.j@hrflow.com', phone: '+92 311 9990000', dept: 'Finance & Operations', pos: 'Financial Analyst', type: 'full-time', salary: 105000, hire: '2022-11-20' },
      { fn: 'Maryam', ln: 'Qureshi', email: 'maryam.q@hrflow.com', phone: '+92 334 1231234', dept: 'Engineering', pos: 'DevOps Engineer', type: 'full-time', salary: 135000, hire: '2022-09-01' },
      { fn: 'Ahmed', ln: 'Nadeem', email: 'ahmed.n@hrflow.com', phone: '+92 305 4564567', dept: 'Engineering', pos: 'Frontend Developer', type: 'contract', salary: 100000, hire: '2023-08-10' }
    ];
    
    const empIds = [hrEmpId, aliEmpId];
    let counter = 3;
    for (const emp of additionalEmployees) {
      const code = 'EM-100' + counter.toString().padStart(3, '0');
      counter++;
      const res = await client.query(
        `INSERT INTO employees (first_name, last_name, email, phone, employee_code, hire_date, status, contract_type, salary, department_id, position_id)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10)
         RETURNING id`,
        [emp.fn, emp.ln, emp.email, emp.phone, code, emp.hire, emp.type, emp.salary, deptMap[emp.dept], posMap[emp.pos]]
      );
      empIds.push(res.rows[0].id);
    }

    // 6. Realistic Attendance (Last 15 days)
    console.log('Seeding attendance...');
    for (const eid of empIds) {
      for (let i = 0; i < 15; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Skip weekends
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        
        const dateStr = d.toISOString().split('T')[0];
        
        // Highly realistic check-in times
        let checkInH = 8;
        let checkInM = Math.floor(Math.random() * 59); // 08:00 to 08:59
        let status = 'present';
        
        // 10% chance of being late
        if (Math.random() > 0.90) {
          status = 'late';
          checkInH = 9;
          checkInM = Math.floor(Math.random() * 45); // 09:00 to 09:45
        }
        
        // 5% chance of being absent (skip record entirely or mark absent if we had absent logic, here we just skip insert to simulate no swipe)
        if (Math.random() > 0.95) continue;

        const checkInStr = `0${checkInH}:${checkInM < 10 ? '0'+checkInM : checkInM}:00`;
        
        // Checkout between 17:00 and 18:30
        const checkOutH = 17 + Math.floor(Math.random() * 2);
        const checkOutM = Math.floor(Math.random() * 59);
        const checkOutStr = `${checkOutH}:${checkOutM < 10 ? '0'+checkOutM : checkOutM}:00`;

        await client.query(
          `INSERT INTO attendance (employee_id, work_date, check_in, check_out, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (employee_id, work_date) DO NOTHING`,
          [eid, dateStr, checkInStr, checkOutStr, status]
        );
      }
    }

    // 7. Realistic Leaves
    console.log('Seeding leaves...');
    await client.query(`
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, approved_by) VALUES
      ($1, 'annual', CURRENT_DATE + 10, CURRENT_DATE + 14, 'Family trip to northern areas', 'approved', $2),
      ($1, 'sick', CURRENT_DATE - 5, CURRENT_DATE - 4, 'Viral infection and fever', 'approved', $2),
      ($3, 'casual', CURRENT_DATE + 2, CURRENT_DATE + 2, 'Attending a family wedding', 'pending', NULL),
      ($4, 'sick', CURRENT_DATE - 1, CURRENT_DATE, 'Food poisoning', 'pending', NULL),
      ($5, 'unpaid', CURRENT_DATE + 20, CURRENT_DATE + 25, 'Personal emergency', 'rejected', $2)
    `, [aliEmpId, hrEmpId, empIds[2], empIds[3], empIds[4]]);

    // 8. Payroll for last 2 months
    console.log('Seeding payrolls...');
    const d = new Date();
    const currentMonth = d.getMonth() + 1;
    const monthsToSeed = [currentMonth === 1 ? 12 : currentMonth - 1, currentMonth === 2 ? 12 : currentMonth - 2];
    const year = d.getFullYear();

    for (const eid of empIds) {
      const empQuery = await client.query('SELECT salary FROM employees WHERE id = $1', [eid]);
      const base = parseFloat(empQuery.rows[0].salary);
      
      for (let month of monthsToSeed) {
        const allowances = base * 0.15; // 15% allowance
        const tax = base * 0.10; // 10% tax
        const deductions = Math.random() > 0.8 ? 2000 : 0; // occasional deduction

        await client.query(`
          INSERT INTO payroll (employee_id, month, year, base_salary, allowances, deductions, tax, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'processed')
          ON CONFLICT (employee_id, month, year) DO NOTHING
        `, [eid, month, month === 12 ? year - 1 : year, base, allowances, deductions, tax]);
      }
    }

    // 9. Performance Reviews
    console.log('Seeding performance reviews...');
    await client.query(`
      INSERT INTO performance_reviews 
      (employee_id, reviewer_id, review_date, review_period, rating, comments, goals, 
       quality_of_work, punctuality, communication, collaboration, initiative, problem_solving)
      VALUES 
      ($1, $2, CURRENT_DATE - 30, 'Q1 2026', 4.5, 'Ali has shown excellent progress. His code quality is top notch, but he needs to communicate more in standups.', 'Lead a front-end epic next quarter', 9, 8, 7, 9, 8, 9),
      ($3, $2, CURRENT_DATE - 45, 'Q1 2026', 5.0, 'Outstanding performance. Zainab single-handedly optimized our database queries resulting in a 40% speed boost.', 'Mentor junior engineers', 10, 10, 9, 10, 10, 10),
      ($4, $2, CURRENT_DATE - 15, 'Q1 2026', 3.5, 'Meeting expectations. Good consistency but needs to improve speed of delivery.', 'Complete AWS certification', 7, 9, 8, 7, 6, 7)
    `, [aliEmpId, hrEmpId, empIds[2], empIds[3]]);

    // 10. Announcements
    console.log('Seeding announcements...');
    await client.query(`
      INSERT INTO announcements (title, content, priority, created_by) VALUES
      ('New Quarterly OKRs', 'Please review the new OKRs for Q2 and align your personal goals accordingly.', 'high', $1),
      ('Eid Holidays Schedule', 'The office will remain closed from Wednesday to Friday for Eid ul Fitr holidays.', 'urgent', $1),
      ('Welcome New Joiners', 'Please join us in welcoming Sana and Omar to the HRFlow family! We are having a small gathering at 4 PM.', 'normal', $1),
      ('Health Insurance Update', 'The updated health insurance cards are ready for pickup from the HR desk.', 'low', $1)
    `, [hrEmpId]);

    // 11. OKR Cycles
    console.log('Seeding OKR cycles...');
    const cycleRes = await client.query(
      `INSERT INTO okr_cycles (name, start_date, end_date, is_active) VALUES 
       ('Q1 2026', '2026-01-01', '2026-03-31', false),
       ('Q2 2026', '2026-04-01', '2026-06-30', true) 
       RETURNING id`
    );
    const q1Cycle = cycleRes.rows[0].id;
    const q2Cycle = cycleRes.rows[1].id;

    // 12. Realistic Goals for Ali
    console.log('Seeding Goals...');
    const goal1 = await client.query(
      `INSERT INTO goals (employee_id, cycle_id, title, description, target, progress, status, created_by) 
       VALUES ($1, $2, 'Refactor Frontend Architecture', 'Migrate legacy components to new React patterns and improve performance.', '100% migrated', 65, 'active', $3) RETURNING id`,
      [aliEmpId, q2Cycle, hrEmpId]
    );
    await client.query(`INSERT INTO key_results (goal_id, title, progress) VALUES 
      ($1, 'Convert 50 class components to functional', 80), 
      ($1, 'Implement React Query for state management', 100), 
      ($1, 'Achieve 95+ Lighthouse score', 15)`, [goal1.rows[0].id]);

    const goal2 = await client.query(
      `INSERT INTO goals (employee_id, cycle_id, title, description, target, progress, status, created_by) 
       VALUES ($1, $2, 'Improve Test Coverage', 'Write comprehensive unit and E2E tests for the dashboard module.', '80% coverage', 100, 'completed', $3) RETURNING id`,
      [aliEmpId, q1Cycle, hrEmpId]
    );
    await client.query(`INSERT INTO key_results (goal_id, title, progress) VALUES 
      ($1, 'Write 100 Jest test cases', 100), 
      ($1, 'Setup Playwright CI/CD pipeline', 100)`, [goal2.rows[0].id]);

    // 13. Notifications for Ali
    console.log('Seeding notifications...');
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES 
       ($1, 'Leave Request Approved', 'Your annual leave request has been approved by HR.', 'leave', '/leave'),
       ($1, 'Payslip Available', 'Your payslip for last month has been generated and is ready to view.', 'payroll', '/payroll'),
       ($1, 'New OKR Assigned', 'HR has assigned a new OKR: Refactor Frontend Architecture.', 'performance', '/performance'),
       ($1, 'Important Announcement', 'Eid Holidays Schedule has been posted. Please review.', 'announcement', '/announcements')`,
      [aliUserId]
    );

    // Notifications for HR
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES 
       ($1, 'Pending Leave Request', 'Ayesha Malik has submitted a sick leave request.', 'leave', '/leave'),
       ($1, 'Pending Leave Request', 'Bilal Hassan has submitted a casual leave request.', 'leave', '/leave')`,
      [hrUserId]
    );

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
