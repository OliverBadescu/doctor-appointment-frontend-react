# 🩺 Doctor Appointment Frontend

A modern and responsive frontend application built with **React.js**, designed to work seamlessly with the Doctor Appointment REST API. This web interface allows patients to manage appointments, doctors to view their schedules, and admins to monitor statistics and manage the system.

---

## 🚀 Features

- 🖥️ **User-Friendly Interface**: Clean and responsive UI built with React.
- 📅 **Appointment Management**: Patients can book, view, and cancel appointments.
- 👨‍⚕️ **Doctor Dashboard**: Doctors can view upcoming appointments and schedules.
- 📊 **Admin Panel**: Admins can view clinic statistics and manage doctor schedules.
- 🔐 **JWT Authentication**: Integrated with backend for secure login and role-based access.
- ⚙️ **Role-Based UI**: Interface adapts based on logged-in user (USER, DOCTOR, ADMIN).

---

## 🛠️ Technologies Used

- **React 18+**
- **JavaScript (ES6+)**
- **React Router DOM**
- **JWT Auth with LocalStorage**
- **React Hook Form** (for form handling and validation)

---

## 🔐 Authentication Flow

- 🔑 Login:
  - Users log in via `/login` by entering their credentials.
  - On success, the JWT token is stored in `userContext` and attached to all protected requests.
  
- 🧾 Token Handling:
  - The token is added to the `Authorization` header:
    ```
    Authorization: Bearer <token>
    ```

- 🚦 Role-based UI rendering:
  - `USER`: Access to appointment booking and history.
  - `DOCTOR`: Access to appointments dashboard and working schedule.
  - `ADMIN`: Access to statistics, clinic management, and doctor controls.

---


