# Фотографии материалов (`docs/images/materialy/`)

Фотографии для блока «Материалы» сайта `saits/sait-13` (вкладки по СВМПЭ, арамиду,
стальному тросу, базальтопластику и полиамиду). Все файлы взяты с Wikimedia Commons
под свободными лицензиями, допускающими коммерческое использование; для CC BY и
CC BY-SA обязательна атрибуция — она выведена подписью под каждым фото в разметке
(`src/data/materials.json`, поле `photo.credit`), поэтому при замене файла правьте и
данные.

Размер в репозитории: 1600 px по ширине (браузерные копии в сайте — 1200 px, JPEG
качеством ~72). Исходники нужны на случай пересборки превью в другом размере.

Справочный кадр `stalnaya-setka-bpla.jpg` в блоке «Материалы» больше не выводится: он
перешёл в раздел «Вынесенный рубеж вокруг объекта и локальная защита оборудования» и
теперь стоит фото карточки «Инженерная защита от БПЛА (ЗОК)» (данные —
`src/data/company.json`, `lines.items[0].photo`), а браузерная копия лежит в
`saits/sait-13/public/images/linii/stalnaya-setka-bpla.jpg`.

| Файл | Что на фото | Лицензия | Автор | Первоисточник |
| --- | --- | --- | --- | --- |
| `svmpe-dyneema-kanat.jpg` | Трос с сердечником из СВМПЭ (Dyneema SK78) в разрезе: волокна сердечника и плетение оплётки | CC BY-SA 3.0 | Justsail | [LIROS XTR Dyneema](https://commons.wikimedia.org/wiki/File:LIROS_XTR_Dyneema.jpg) |
| `aramid-kevlar-nit.jpg` | Катушки пара-арамидной нити на производстве | CC BY-SA 3.0 | Bodyarmor | [Para Aramid Yarns Body Armor](https://commons.wikimedia.org/wiki/File:Para_Aramid_Yarns_Body_Armor.jpg) |
| `stalnoy-tros-kanat.jpg` | Стальной канат крупным планом: пряди и отдельные проволоки | CC0 | W.carter | [Steel wire rope on a drum](https://commons.wikimedia.org/wiki/File:Steel_wire_rope_on_a_drum.jpg) |
| `bazaltovoe-volokno.jpg` | Образцы базальтового и стеклянного волокна перед огневым испытанием | CC BY 3.0 | Nils Austa | [Basalt fibre and glass fibre](https://commons.wikimedia.org/wiki/File:Basalt_fibre_and_glass_fibre.jpg) |
| `poliamidnaya-setka.jpg` | Ячейка полиамидной сети крупным планом: узлы вязки | CC BY-SA 3.0 | Jean-Pierre Bazard (Jpbazard) | [Maillage d'un filet de pêche à la civelle (1)](https://commons.wikimedia.org/wiki/File:Maillage_d%27un_filet_de_p%C3%AAche_%C3%A0_la_civelle_(1).JPG) |
| `stalnaya-setka-bpla.jpg` | Сетчатый контур заводского изготовления вокруг здания газовой инфраструктуры (Москва) — справочный кадр, не наш объект; выводится фото карточки «Инженерная защита от БПЛА (ЗОК)» в разделе «Вынесенный рубеж…», а не в блоке материалов | CC0 | Gjvjoybr | [Противодроновая сетка вокруг объекта в Москве](https://commons.wikimedia.org/wiki/File:2025-11-29_%D0%BF%D1%80%D0%BE%D1%82%D0%B8%D0%B2%D0%BE%D0%B4%D1%80%D0%BE%D0%BD%D0%BE%D0%B2%D0%B0%D1%8F_%D1%81%D0%B5%D1%82%D0%BA%D0%B0_%D0%B2%D0%BE%D0%BA%D1%80%D1%83%D0%B3_%D0%BE%D0%B1%D1%8A%D0%B5%D0%BA%D1%82%D0%B0_%D0%B2_%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B5_(20251129_132557).jpg) |

## Как обновлять

1. Проверить лицензию: подходят CC0, CC BY, CC BY-SA (коммерческое использование разрешено). Фото «только для некоммерческого использования» (CC BY-NC) не подходят.
2. Скачать файл по ширине 1600 px (миниатюра Commons), положить в эту папку.
3. Сделать браузерную копию 1200 px в `saits/sait-13/public/images/materialy/` (JPEG, качество ~72). Исключение — `stalnaya-setka-bpla.jpg`: он выводится фото карточки ЗОК, поэтому копия лежит в `saits/sait-13/public/images/linii/` и кодируется так же — 1200 px, JPEG качество 72 (`cjpeg -quality 72 -optimize -progressive`).
4. Обновить `photo` (src, alt, width, height, credit, creditUrl) в `saits/sait-13/src/data/materials.json` — подпись с автором и лицензией обязана совпадать с первоисточником.
