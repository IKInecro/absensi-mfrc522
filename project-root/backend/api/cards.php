<?php
/**
 * cards.php
 * Endpoint CRUD Kartu RFID
 * Method: GET, POST, PUT, DELETE
 * Fitur: assign kartu ke siswa, mode registrasi
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // ?id= -> detail kartu
        // ?student_id= -> filter berdasarkan siswa
        $params = [];
        $sql = "SELECT c.*, s.name AS student_name, s.class FROM cards c LEFT JOIN students s ON c.student_id=s.id WHERE 1=1";
        if (!empty($_GET['id'])) {
            $sql .= " AND c.id = ?";
            $params[] = intval($_GET['id']);
        }
        if (!empty($_GET['student_id'])) {
            $sql .= " AND c.student_id = ?";
            $params[] = intval($_GET['student_id']);
        }
        $rows = DB_QUERY($sql, $params)->fetchAll();
        send_json(true, "Cards fetched", $rows);
        break;

    case 'POST':
        // Tambah kartu baru
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['uid'])) {
            send_json(false, "UID required");
        }
        $student_id = !empty($input['student_id']) ? intval($input['student_id']) : null;
        DB_QUERY("INSERT INTO cards(uid,student_id,active) VALUES(?,?,1)", [
            htmlspecialchars($input['uid']),
            $student_id
        ]);
        send_json(true, "Card added");
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $input);
        if (empty($input['id'])) send_json(false, "ID required");
        $fields = [];
        $params = [];
        if (isset($input['student_id'])) {
            $fields[] = "student_id=?";
            $params[] = $input['student_id'] === '' ? null : intval($input['student_id']);
        }
        if (isset($input['active'])) {
            $fields[] = "active=?";
            $params[] = intval($input['active']);
        }
        if (empty($fields)) send_json(false, "No update fields");
        $params[] = intval($input['id']);
        DB_QUERY("UPDATE cards SET " . implode(',', $fields) . " WHERE id=?", $params);
        send_json(true, "Card updated");
        break;

    case 'DELETE':
        parse_str(file_get_contents('php://input'), $input);
        if (empty($input['id'])) send_json(false, "ID required");
        DB_QUERY("DELETE FROM cards WHERE id=?", [intval($input['id'])]);
        send_json(true, "Card deleted");
        break;

    default:
        send_json(false, "Invalid method");
}
?>