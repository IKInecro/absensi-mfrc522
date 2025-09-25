<?php
/**
 * devices.php
 * Endpoint CRUD Device ESP8266
 * Method: GET, POST, PUT, DELETE
 * Fitur: status online/offline realtime, update heartbeat
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // ?id= -> detail device
        $params = [];
        $sql = "SELECT *, TIMESTAMPDIFF(SECOND,last_heartbeat,NOW()) AS since_last FROM devices WHERE 1=1";
        if (!empty($_GET['id'])) {
            $sql .= " AND id = ?";
            $params[] = intval($_GET['id']);
        }
        $rows = DB_QUERY($sql, $params)->fetchAll();
        // Hitung status online/offline (threshold 30 detik)
        foreach ($rows as &$r) {
            $r['status'] = ($r['since_last'] <= 30) ? 'online' : 'offline';
        }
        send_json(true, "Devices fetched", $rows);
        break;

    case 'POST':
        // Tambah device baru
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['name'])) send_json(false, "Name required");
        DB_QUERY("INSERT INTO devices(name,location) VALUES(?,?)", [
            htmlspecialchars($input['name']),
            htmlspecialchars($input['location'] ?? '')
        ]);
        send_json(true, "Device added");
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $input);
        if (empty($input['id'])) send_json(false, "ID required");

        // Jika ada field heartbeat, update last_heartbeat untuk status online
        if (!empty($input['heartbeat'])) {
            DB_QUERY("UPDATE devices SET last_heartbeat=NOW() WHERE id=?", [intval($input['id'])]);
            send_json(true, "Heartbeat updated");
        } else {
            $fields = [];
            $params = [];
            if (isset($input['name'])) {
                $fields[] = "name=?";
                $params[] = htmlspecialchars($input['name']);
            }
            if (isset($input['location'])) {
                $fields[] = "location=?";
                $params[] = htmlspecialchars($input['location']);
            }
            if (empty($fields)) send_json(false, "No update fields");
            $params[] = intval($input['id']);
            DB_QUERY("UPDATE devices SET " . implode(',', $fields) . " WHERE id=?", $params);
            send_json(true, "Device updated");
        }
        break;

    case 'DELETE':
        parse_str(file_get_contents('php://input'), $input);
        if (empty($input['id'])) send_json(false, "ID required");
        DB_QUERY("DELETE FROM devices WHERE id=?", [intval($input['id'])]);
        send_json(true, "Device deleted");
        break;

    default:
        send_json(false, "Invalid method");
}
?>