<?php

if (isset($_POST["fmc__btn"]) && isset($_POST["antirobotpro"]) &&	$_POST["antirobotpro"] == "gdfg56FG423er") {
	$to = "info@sait-myt.ru";
	$subject = "Заявка на сайт";
	$charset = "utf-8";
	$un = strtoupper(uniqid(time()));
	$head = "Mime-Version: 1.0\r\n";
	$head .= "Content-Type:multipart/mixed;";
	$head .= "boundary=\"----------" . $un . "\"\n\n";
	$body = "------------" . $un . "\nContent-Type:text/html; charset=$charset\r\n";
	$msg =	"Имя: " . $_POST["fmc__name"] . "\n<br />" . "Телефон: " . $_POST["fmc__phone"] . "\n<br />" . "";
	$body .= "Content-Transfer-Encoding: 8bit\n\n" . $msg . "\n\n";
	mail($to, $subject, $body, $head);
	print "<script>alert('Сообщение успешно отправлено!'); window.location = '" . $_SERVER['REQUEST_URI '] . "';</script>";
}

?>
<!-- -->