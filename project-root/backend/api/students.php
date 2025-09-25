<?php
/**
 * students.php
 * Endpoint CRUD Siswa
 * Method: GET (list/search), POST (create), PUT (update), DELETE (delete)
 * Fitur: filter per kelas, pencarian nama, validasi input
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // ?id= -> ambil detail siswa
        // ?class= -> filter per kelas
        // ?search= -> pencarian nama
        $params = [];
        $sql = "SELECT * FROM students WHERE 1=1";
        if (!empty($_GET['id'])) {
            $sql .= " AND id = ?";
            $params[] = intval($_GET['id']);
        }
        if (!empty($_GET['class'])) {
            $sql .= " AND class = ?";
            $params[] = $_GET['class'];
        }
        if (!empty($_GET['search'])) {
            $sql .= " AND name LIKE ?";
            $params[] = "%" . $_GET['search'] . "%";
        }
        $sql .= " ORDER BY name ASC";
        $rows = DB_QUERY($sql, $params)->fetchAll();
        send_json(true, "Students fetched", $rows);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['name']) || empty($input['class'])) {
            send_json(false, "Name and class required");
        }
        DB_QUERY("INSERT INTO students(name,class) VALUES(?,?)", [
            htmlspecialchars($input['name']),
            htmlspecialchars($input['class'])
        ]);
        send_json(true, "Student added");
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $input);
        if (empty($input['id']) || empty($input['name']) || empty($input['class'])) {
            send_json(false, "ID, name, class required");
        }
        DB_QUERY("UPDATE students SET name=?, class=? WHERE id=?", [
            htmlspecialchars($input['name']),
            htmlspecialchars($input['class']),
            intval($input['id'])
        ]);
        send_json(true, "Student updated");
        break;

    case 'DELETE':
        parse_str(file_get_contents('php://input'), $input);
        if (empty($input['id'])) send_json(false, "ID required");
        DB_QUERY("DELETE FROM students WHERE id=?", [intval($input['id'])]);
        send_json(true, "Student deleted");
        break;

    default:
        send_json(false, "Invalid method");
}
?>