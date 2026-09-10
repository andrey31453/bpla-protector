<?php
if (isset($_POST["fmc__btn"]) && isset($_POST["antirobotpro"]) &&	$_POST["antirobotpro"] == "gdfg56FG423er") {
	$to = "info@geovr.ru";
	$subject = "Заявка на сайт";
	$charset = "utf-8";
	$un = strtoupper(uniqid(time()));
	$head = "Mime-Version: 1.0\r\n";
	$head .= "Content-Type:multipart/mixed;";
	$head .= "boundary=\"----------" . $un . "\"\n\n";
	$body = "------------" . $un . "\nContent-Type:text/html; charset=$charset\r\n";
	$msg =	"Тип лица: <strong>" . $_POST["fmc__type"] . "</strong>\n<br />" . "Телефон: <strong>" . $_POST["fmc__phone"] . "</strong>\n<br />" . "Данные из квиза: " . $_POST["quiz-data"] . "\n<br />" . "";
	$body .= "Content-Transfer-Encoding: 8bit\n\n" . $msg . "\n\n";
	mail($to, $subject, $body, $head);
	print "<script>alert('Сообщение успешно отправлено!'); window.location = '" . $_SERVER['REQUEST_URI '] . "';</script>";
}
?>