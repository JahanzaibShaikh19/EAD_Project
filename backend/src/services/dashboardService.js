import pool from '../config/db.js';

export const dashboardService = {
  async getHRStats(monthStr, yearStr) {
    const month = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonthDate = new Date(year, month, 1).toISOString().split('T')[0];

    // 1. Total employees (up to the end of the selected month)
    const totalEmployeesPromise = pool.query(`SELECT COUNT(*) FROM employees WHERE status='active' AND hire_date < $1`, [nextMonthDate]);
    
    // 2. Attendance rate (present + late / total)
    const attendanceRatePromise = pool.query(`
      SELECT 
        COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as attendance_rate
      FROM attendance
      WHERE work_date >= $1 AND work_date < $2
    `, [startDate, nextMonthDate]);
    
    // 3. Department distribution
    const deptDistributionPromise = pool.query(`
      SELECT d.name, COUNT(e.id) as value
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'active'
      GROUP BY d.name
    `);
    
    // 4. This week attendance -> Change to selected month attendance total
    const weekAttendancePromise = pool.query(`
      SELECT COUNT(*) as count 
      FROM attendance 
      WHERE work_date >= $1 AND work_date < $2 AND status IN ('present', 'late')
    `, [startDate, nextMonthDate]);
    
    // 5. Hires per month for selected year
    const hiresPromise = pool.query(`
      SELECT DATE_TRUNC('month', hire_date) as month, COUNT(*) as hires 
      FROM employees 
      WHERE EXTRACT(YEAR FROM hire_date) = $1 
      GROUP BY month
      ORDER BY month
    `, [year]);

    // 6. Recent employees (latest hires up to the selected month)
    const recentEmployeesPromise = pool.query(`
      SELECT e.id, e.first_name, e.last_name, e.photo_url, e.contract_type, 
             p.title as position_title, d.name as dept_name
      FROM employees e
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.hire_date < $1
      ORDER BY e.hire_date DESC, e.created_at DESC
      LIMIT 5
    `, [nextMonthDate]);

    // 7. Company daily attendance for the selected month
    const companyDailyAttendancePromise = pool.query(`
      SELECT 
        TO_CHAR(work_date, 'YYYY-MM-DD') as work_date,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        COUNT(CASE WHEN status = 'on-leave' THEN 1 END) as leave_count,
        COUNT(CASE WHEN status = 'holiday' THEN 1 END) as holiday_count
      FROM attendance
      WHERE work_date >= $1 AND work_date < $2
      GROUP BY work_date
      ORDER BY work_date
    `, [startDate, nextMonthDate]);

    const [totalEmp, attRate, deptDist, weekAtt, hires, recentEmp, dailyAtt] = await Promise.all([
      totalEmployeesPromise,
      attendanceRatePromise,
      deptDistributionPromise,
      weekAttendancePromise,
      hiresPromise,
      recentEmployeesPromise,
      companyDailyAttendancePromise
    ]);

    return {
      totalEmployees: parseInt(totalEmp.rows[0].count),
      attendanceRate: parseFloat(attRate.rows[0].attendance_rate || 0).toFixed(1),
      departmentDistribution: deptDist.rows.map(r => ({ name: r.name, value: parseInt(r.value) })),
      thisWeekAttendance: parseInt(weekAtt.rows[0].count),
      hiresTrend: hires.rows.map(r => ({ 
        month: new Date(r.month).toLocaleString('default', { month: 'short' }),
        hires: parseInt(r.hires)
      })),
      recentEmployees: recentEmp.rows,
      companyDailyAttendance: dailyAtt.rows.map(r => ({
        work_date: r.work_date,
        present: parseInt(r.present_count),
        absent: parseInt(r.absent_count),
        late: parseInt(r.late_count),
        leave: parseInt(r.leave_count),
        holiday: parseInt(r.holiday_count),
        total_active: parseInt(totalEmp.rows[0].count)
      }))
    };
  },

  async getMyStats(employee_id, monthStr, yearStr) {
    const month = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonthDate = new Date(year, month, 1).toISOString().split('T')[0];

    // 1. Attendance this month
    const attendancePromise = pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count
      FROM attendance 
      WHERE employee_id = $1 AND work_date >= $2 AND work_date < $3
    `, [employee_id, startDate, nextMonthDate]);

    // 2. Pending leave requests in that month
    const leavePromise = pool.query(`
      SELECT COUNT(*) as pending_leaves
      FROM leave_requests
      WHERE employee_id = $1 AND status = 'pending' AND start_date < $3 AND end_date >= $2
    `, [employee_id, startDate, nextMonthDate]);

    // 3. Last payslip for that month (or latest before that month ends)
    const payslipPromise = pool.query(`
      SELECT * 
      FROM payroll
      WHERE employee_id = $1 AND status = 'processed'
        AND year <= $3 AND (year < $3 OR month <= $2)
      ORDER BY year DESC, month DESC
      LIMIT 1
    `, [employee_id, month, year]);

    // 4. Active goals
    const goalsPromise = pool.query(`
      SELECT COUNT(*) as active_goals
      FROM goals
      WHERE employee_id = $1 AND status = 'active'
    `, [employee_id]);

    const [att, leave, payslip, goals] = await Promise.all([
      attendancePromise,
      leavePromise,
      payslipPromise,
      goalsPromise
    ]);

    return {
      presentDays: parseInt(att.rows[0]?.present_count || 0),
      absentDays: parseInt(att.rows[0]?.absent_count || 0),
      leaveBalance: 14,
      pendingLeaves: parseInt(leave.rows[0]?.pending_leaves || 0),
      lastPayDate: payslip.rows[0]?.processed_date || null,
      lastNetSalary: payslip.rows[0]?.net_salary || 0,
      activeGoals: parseInt(goals.rows[0]?.active_goals || 0)
    };
  }
};
