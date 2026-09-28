"""Семейство C: новая сцена — фото подстанции + ЗОК, нарисованный в перспективе.

Идея: сцена задаётся камерой (горизонт, фокус, высота над землёй) и рисуется
в метрах — мачты, канаты, полотно и анкеры проецируются в пиксели той же
перспективой, что и само фото. Поэтому полотно не «наклеено», а стоит в сцене:
ячейка уходит по перспективе, дальние части уходят в воздушную дымку,
пояса и оттяжки садятся на реальные анкеры.

Координаты: X — вправо, Y — вверх от земли, Z — вглубь от камеры (метры).

Запуск (из корня репозитория или откуда угодно):
    ZOK_SRC=/путь/к/снимку.jpg python3 docs/images/zok-viz/tools/family_c.py c1
Кадры кладутся рядом со скриптом (docs/images/zok-viz), папку можно переопределить
переменной окружения ZOK_OUT.

Исходный снимок подстанции в репозитории не хранится (удалён по решению заказчика),
поэтому путь к копии задаётся переменной ZOK_SRC. Без неё скрипт пробует старый путь
docs/images/dop/podstanciya-110kv-foto-zakazchika.jpg и, если фото нет, останавливается
с понятным сообщением — молча подставлять другое изображение он не будет.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
# исходное фото (снимок подстанции): в репозитории не хранится, путь задаётся ZOK_SRC
SRC_REPO = os.path.normpath(os.path.join(HERE, '..', '..', 'dop',
                                         'podstanciya-110kv-foto-zakazchika.jpg'))
SRC = os.environ.get('ZOK_SRC') or SRC_REPO
OUT_DIR = os.environ.get('ZOK_OUT') or os.path.normpath(os.path.join(HERE, '..'))
OUT_PREFIX = 'zok-sub-'          # имена кадров: zok-sub-c1.jpg, zok-sub-c2.jpg, ...
OUT = 2                      # во сколько раз увеличиваем итоговый кадр
DRW = 2                      # супердискретизация рисования
S = OUT * DRW                # масштаб слоя рисования относительно исходного кадра

# --- камера (подобрана по фото: горизонт 162 px, ближнее здание ~34 м) ---
F = 600.0                    # фокус, px исходного кадра
CX, YH = 400.0, 162.0        # центр по горизонтали и линия горизонта
HCAM = 17.3                  # высота камеры над землёй, м (по пилону ВЛ ~40 м)

# --- солнце: спереди-слева, высота 45° (по блику на ближней технике) ---
SUN = np.array([-0.30, 0.71, -0.64], dtype=np.float64)


def p2d(X, Y, Z):
    """Точка (м) -> пиксели исходного кадра."""
    k = F / Z
    return (CX + X * k, YH - (Y - HCAM) * k)


def d2d(X, Y, Z):
    """Точка (м) -> пиксели слоя рисования (с супердискретизацией)."""
    x, y = p2d(X, Y, Z)
    return (x * S, y * S)


def sun_shadow(X, Y, Z):
    """Сдвиг тени: проекция точки на землю (Y=0) вдоль направления солнца."""
    t = Y / SUN[1]
    return (X - t * SUN[0], Z - t * SUN[2])


def new_layer():
    return Image.new('L', (int(800 * S), int(531 * S)), 0)


_DRAW = {}


def _dr(layer):
    """Кэш ImageDraw на слой (иначе каждый отрезок создаёт объект заново)."""
    key = id(layer)
    item = _DRAW.get(key)
    if item is None or item[0] is not layer:
        item = (layer, ImageDraw.Draw(layer))
        _DRAW[key] = item
    return item[1]


def draw_on(layer):
    return ImageDraw.Draw(layer)


def line(layer, a, b, width=1.0, val=255, samples=1):
    """Отрезок в метрах: a=(X,Y,Z), b=(X,Y,Z). samples>1 — ломаная."""
    w = max(1, int(round(width * S)))
    if samples > 1:
        pts = []
        for i in range(samples + 1):
            pts.append(d2d(*_lerp3(a, b, i / float(samples))))
        _dr(layer).line(pts, fill=int(val), width=w)
    else:
        _dr(layer).line([d2d(*a), d2d(*b)], fill=int(val), width=w)


def _lerp3(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def sag_line(layer, a, b, sag, width=1.0, val=255, samples=14):
    """Провисающая нить: параболой между двумя точками (провис вниз)."""
    pts = []
    for i in range(samples + 1):
        t = i / float(samples)
        X = a[0] + (b[0] - a[0]) * t
        Z = a[2] + (b[2] - a[2]) * t
        Y = a[1] + (b[1] - a[1]) * t - 4.0 * sag * t * (1.0 - t)
        pts.append(d2d(X, Y, Z))
    _dr(layer).line(pts, fill=int(val), width=max(1, int(round(width * S))))


def base_image():
    """Фото 800x531 -> полотно OUT-масштаба, вотермарка убрана, чуть подшарплено."""
    if not os.path.exists(SRC):
        raise SystemExit(
            'Не найден исходный снимок подстанции: %s\n'
            'В репозитории он не хранится. Задайте путь к копии, например:\n'
            '    ZOK_SRC=/путь/к/snimok-podstancii.jpg python3 %s c1'
            % (SRC, os.path.relpath(__file__)))
    im = Image.open(SRC).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    # вотермарка в правом нижнем углу: берём полосу слева и мягко накладываем
    y0, y1 = 492, 531
    x0, x1 = 700, 800
    src = a[y0:y1, x0 - 175:x1 - 175, :].copy()
    patch = a[y0:y1, x0:x1, :]
    h, w = patch.shape[0], patch.shape[1]
    fade = np.linspace(0.0, 1.0, w, dtype=np.float32)[None, :, None]
    fade = np.clip((fade - 0.1) / 0.55, 0, 1)
    a[y0:y1, x0:x1, :] = patch * (1 - fade) + src * fade
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if OUT > 1:
        im = im.resize((800 * OUT, 531 * OUT), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=3))
    return im


# --------------------------------------------------------------------------
# маски сцены
# --------------------------------------------------------------------------

# Ближняя техника и здание (стоят перед дальней частью двора): полотно не должно
# рисоваться поверх них. Полигоны в пикселях исходного кадра (проверены наложением).
OCCLUDERS = [
    [(176, 486), (176, 318), (348, 300), (700, 306), (700, 480), (612, 486)],
    [(616, 470), (616, 292), (800, 286), (800, 472), (700, 480)],
]


def build_occluder():
    layer = Image.new('L', (int(800 * S), int(531 * S)), 0)
    d = ImageDraw.Draw(layer)
    for poly in OCCLUDERS:
        d.polygon([(x * S, y * S) for x, y in poly], fill=255)
    return layer.filter(ImageFilter.GaussianBlur(0.8 * S))


def grass_mask(base):
    """Где в кадре трава (для тени полотна на грунте)."""
    a = np.asarray(base).astype(np.float32)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    lum = a.mean(2)
    m = (g > r + 4) & (g > b + 8) & (lum > 45) & (lum < 210)
    yy = np.arange(a.shape[0])[:, None] / OUT
    m &= yy > 250
    return m.astype(np.float32)


# --------------------------------------------------------------------------
# элементы ЗОК
# --------------------------------------------------------------------------

def haze(Z, near=45.0, far=170.0, k=0.55):
    """Множитель контраста: дальние элементы уходят в воздушную дымку."""
    t = min(1.0, max(0.0, (Z - near) / (far - near)))
    return 1.0 - k * t


def mast(layer, X, Z, H, hb=0.75, ht=0.30, bay=1.15, w=0.055):
    """Решётчатая стойка: 4 пояса, распорки, крестовые связи, оголовок."""
    def half(y):
        return hb + (ht - hb) * min(1.0, max(0.0, y / H))

    width = max(1.0, w * F / Z)
    val = int(255 * haze(Z))
    y = 0.0
    while y < H - 1e-6:
        y2 = min(H, y + bay)
        h1, h2 = half(y), half(y2)
        c1 = [(X - h1, y, Z), (X + h1, y, Z), (X + h1, y, Z + 2 * h1), (X - h1, y, Z + 2 * h1)]
        c2 = [(X - h2, y2, Z), (X + h2, y2, Z), (X + h2, y2, Z + 2 * h2), (X - h2, y2, Z + 2 * h2)]
        for i in range(4):
            line(layer, c1[i], c2[i], width, val)
            line(layer, c2[i], c2[(i + 1) % 4], width, val)
            line(layer, c1[i], c2[(i + 1) % 4], width * 0.75, val)
            line(layer, c2[i], c1[(i + 1) % 4], width * 0.75, val)
        y = y2
    ht_ = half(H)
    line(layer, (X - ht_, H, Z), (X + ht_, H, Z + 2 * ht_), max(1.0, width), val)
    line(layer, (X - ht_, H, Z + 2 * ht_), (X + ht_, H, Z), max(1.0, width), val)


def anchor(layer, X, Z, size=1.3):
    """Бетонный анкер под оттяжку: верхняя и фронтальная грани блока."""
    d = ImageDraw.Draw(layer)
    k = haze(Z, k=0.4)
    h = 0.75
    d.polygon([d2d(p[0], h, p[2]) for p in
               [(X - size, 0, Z - size), (X + size, 0, Z - size),
                (X + size, 0, Z + size), (X - size, 0, Z + size)]], fill=int(200 * k))
    d.polygon([d2d(X - size, 0, Z - size), d2d(X + size, 0, Z - size),
               d2d(X + size, h, Z - size), d2d(X - size, h, Z - size)], fill=int(155 * k))


def guy(layer, X, Z, Y0, X1, Z1, sag=0.9, w=0.05):
    k = haze((Z + Z1) * 0.5, k=0.5)
    sag_line(layer, (X, Y0, Z), (X1, 0, Z1), sag, width=max(1.1, w * F / Z), val=int(255 * k))


def roof_fade(Z):
    """Множитель яркости нитей кровли: у дальней кромки ячейка уже не читается,
    а «гребёнка» нитей, уходящих в точку сходу, выглядит как ложные канаты вдаль."""
    if Z <= 52.0:
        return 1.0
    return max(0.0, (92.0 - Z) / 40.0)


def mesh_line(layer, pts, width_src, val_fn, chunk=4):
    """Ломаная из точек (м): рисуется кусками, яркость — по дальности куска."""
    pts = [p for p in pts if p[2] >= Z_NEAR]
    n = len(pts)
    if n < 2:
        return
    i = 0
    while i < n - 1:
        j = min(n - 1, i + chunk)
        seg = pts[i:j + 1]
        zmid = sum(p[2] for p in seg) / len(seg)
        _dr(layer).line([d2d(*p) for p in seg], fill=int(255 * val_fn(zmid)),
                        width=max(1, int(round(width_src * S))))
        i = j

def sag_par(t, lines, s, step=None):
    """Провис между соседними линиями опор: парабола по доле пролёта."""
    if s <= 0:
        return 0.0
    if step is None:
        step = lines[1] - lines[0]
    f = ((t - lines[0]) % step) / step
    return 4.0 * s * f * (1.0 - f)


class Zone:
    """Контур ЗОК: прямоугольник в плане, высота полотна, линии опор."""

    def __init__(self, x0, x1, z0, z1, h, mx, mz, sag_x=0.30, sag_z=0.30,
                 sag_belt=0.22, cell=0.60, bulge=0.28):
        self.x0, self.x1, self.z0, self.z1, self.h = x0, x1, z0, z1, h
        self.mx, self.mz = list(mx), list(mz)
        self.sx, self.sz = sag_x, sag_z
        self.sag_belt, self.cell, self.bulge = sag_belt, cell, bulge

    # --- поверхности ---
    def roof_y(self, X, Z):
        return (self.h - sag_par(X, self.mx, self.sx) - sag_par(Z, self.mz, self.sz) - 0.10)

    def wall_x(self, side, Z):
        """Небольшая выпуклость полотна между опорами (наружу)."""
        b = self.bulge * sag_par(Z, self.mz, 1.0)
        return self.x0 - b if side == 'L' else self.x1 + b

    def wall_z(self, side, X):
        b = self.bulge * sag_par(X, self.mx, 1.0)
        return self.z0 - b if side == 'F' else self.z1 + b

    # --- сетка полотна ---
    def roof_mesh(self, layers, val_fn, w=0.9, fade=None):
        Y = self.roof_y

        def vf(Z):
            v = val_fn(Z)
            return v * fade(Z) if fade is not None else v

        # нити поперёк (по X): у горизонта их шаг схлопывается — прореживаем,
        # иначе полотно сливается в сплошное пятно вместо читаемой ячейки
        for X in np.arange(self.x0, self.x1 + 1e-6, self.cell):
            pts = [(X, Y(X, z), z) for z in np.arange(max(self.z0, Z_NEAR),
                                                      self.z1 + 1e-6, 1.6)]
            mesh_line(layers['net'], pts, w, vf)
        for Z in np.arange(max(self.z0, Z_NEAR), self.z1 + 1e-6, self.cell):
            dy = abs(p2d(0.0, Y(0.0, Z), Z)[1] - p2d(0.0, Y(0.0, Z + self.cell),
                                                     Z + self.cell)[1])
            k = int(math.ceil(1.5 / max(1e-3, dy)))
            if k > 1:
                idx = int(round((Z - self.z0) / self.cell))
                if idx % k:
                    continue
            pts = [(x, Y(x, Z), Z) for x in np.arange(self.x0, self.x1 + 1e-6, 1.6)]
            mesh_line(layers['net'], pts, w, vf)

    def frame_cables(self, layer, val_fn, w=1.4):
        """Опорные канаты кровли, на которых висит полотно, и периметральный канат.

        Именно они читаются «линиями, на которых висит сетка»: вдоль каждой линии
        мачт (в двух направлениях) плюс замкнутый канат по кромке кровли. За кромкой
        конструкция заканчивается — дальше идут уже чужие объекты (дальний ряд ОРУ,
        опора ВЛ), и обрыв каната это показывает.
        """
        Y = self.roof_y
        for X in self.mx:
            pts = [(X, Y(X, z), z) for z in np.arange(max(self.z0, Z_NEAR),
                                                      self.z1 + 1e-6, 2.0)]
            mesh_line(layer, pts, w, val_fn, chunk=6)
        for Z in self.mz:
            if Z < Z_NEAR:
                continue
            pts = [(x, Y(x, Z), Z) for x in np.arange(self.x0, self.x1 + 1e-6, 2.0)]
            mesh_line(layer, pts, w, val_fn, chunk=6)
        for Z in (max(self.z0, Z_NEAR), self.z1):          # кромка кровли
            pts = [(x, Y(x, Z), Z) for x in np.arange(self.x0, self.x1 + 1e-6, 2.0)]
            mesh_line(layer, pts, w * 1.45, val_fn, chunk=6)
        for X in (self.x0, self.x1):
            pts = [(X, Y(X, z), z) for z in np.arange(max(self.z0, Z_NEAR),
                                                      self.z1 + 1e-6, 2.0)]
            mesh_line(layer, pts, w * 1.45, val_fn, chunk=6)

    def wall_mesh(self, layers, side, val_fn, hole=None, w=0.9, fade=None):
        step = self.cell

        def vf(Z):
            v = val_fn(Z)
            return v * fade(Z) if fade is not None else v

        lo, hi = (self.z0, self.z1) if side in ('L', 'R') else (self.x0, self.x1)
        for t in np.arange(lo, hi + 1e-6, step):        # вертикальные нити
            if hole and hole[0] <= t <= hole[1]:
                continue
            ys = np.arange(0.0, self.h + 1e-6, 1.8)
            pts = ([(self.wall_x(side, t), y, t) for y in ys] if side in ('L', 'R')
                   else [(t, y, self.wall_z(side, t)) for y in ys])
            mesh_line(layers['net'], pts, w, vf)
        for y in np.arange(0.0, self.h + 1e-6, step):   # горизонтальные нити
            ts = np.arange(lo, hi + 1e-6, 1.8)
            pts = ([(self.wall_x(side, t), y, t) for t in ts] if side in ('L', 'R')
                   else [(t, y, self.wall_z(side, t)) for t in ts])
            if hole and hole[2] <= y <= hole[3]:        # проём под ввод ВЛ
                segs, run = [], []
                for p in pts:
                    tv = p[2] if side in ('L', 'R') else p[0]
                    if hole[0] <= tv <= hole[1]:
                        if len(run) > 1:
                            segs.append(run)
                        run = []
                    else:
                        run.append(p)
                if len(run) > 1:
                    segs.append(run)
                for seg in segs:
                    mesh_line(layers['net'], seg, w, vf)
            else:
                mesh_line(layers['net'], pts, w, vf)


    def belts(self, layers, sides, val_fn, levels=(5.5, 11.0, 16.5, 22.0), w=1.3):
        """Горизонтальные пояса-канаты между опорами (по схеме каркаса)."""
        for side in sides:
            lines = self.mz if side in ('L', 'R') else self.mx
            for y in [lv for lv in levels if lv < self.h - 0.5]:
                for i in range(len(lines) - 1):
                    if side in ('L', 'R'):
                        z1, z2 = lines[i], lines[i + 1]
                        a = (self.wall_x(side, z1), y, z1)
                        b = (self.wall_x(side, z2), y, z2)
                    else:
                        x1, x2 = lines[i], lines[i + 1]
                        a = (x1, y, self.wall_z(side, x1))
                        b = (x2, y, self.wall_z(side, x2))
                    if abs(p2d(*a)[0]) > 3000 or abs(p2d(*b)[0]) > 3000:
                        continue
                    w_src = max(w, 0.030 * F / max(20.0, min(a[2], b[2])))
                    sag_line(layers['cable'], a, b, self.sag_belt, width=w_src,
                             val=int(255 * val_fn((a[2] + b[2]) / 2)), samples=10)

    def veil(self, layers, sides, val_fn):
        """Вуаль: тонкая пелена полотна, чуть меняющая тон фона."""
        d = _dr(layers["veil"])
        step = 6.0
        for side in sides:
            if side == 'roof':
                for x in np.arange(self.x0, self.x1, 9.0):
                    for z in np.arange(max(self.z0, Z_NEAR), self.z1, 9.0):
                        x2, z2 = min(self.x1, x + 9.0), min(self.z1, z + 9.0)
                        quad = [(x, self.roof_y(x, z), z), (x2, self.roof_y(x2, z), z),
                                (x2, self.roof_y(x2, z2), z2), (x, self.roof_y(x, z2), z2)]
                        d.polygon([d2d(*p) for p in quad],
                                  fill=int(255 * val_fn((z + z2) / 2)))
                continue
            lo, hi = (self.z0, self.z1) if side in ('L', 'R') else (self.x0, self.x1)
            if side in ('L', 'R'):
                lo = max(lo, Z_NEAR)
            for t in np.arange(lo, hi, step):
                t2 = min(hi, t + step)
                for y in np.arange(0.0, self.h, step):
                    y2 = min(self.h, y + step)
                    if side in ('L', 'R'):
                        quad = [(self.wall_x(side, t), y, t), (self.wall_x(side, t2), y, t2),
                                (self.wall_x(side, t2), y2, t2), (self.wall_x(side, t), y2, t)]
                        zm = (t + t2) / 2
                    else:
                        quad = [(t, y, self.wall_z(side, t)), (t2, y, self.wall_z(side, t2)),
                                (t2, y2, self.wall_z(side, t2)), (t, y2, self.wall_z(side, t))]
                        zm = (self.wall_z(side, t) + self.wall_z(side, t2)) / 2
                    d.polygon([d2d(*p) for p in quad], fill=int(255 * val_fn(zm)))

    def roof_film(self, layer, val_fn):
        """Плёнка кровли: полотно видно «в скользь», поэтому у горизонта оно
        сливается в пелену. Плотность растёт с дальностью (угол обзора всё острее)."""
        d = _dr(layer)
        for x in np.arange(self.x0, self.x1, 6.0):
            for z in np.arange(max(self.z0, Z_NEAR), self.z1, 6.0):
                x2, z2 = min(self.x1, x + 6.0), min(self.z1, z + 6.0)
                quad = [(x, self.roof_y(x, z), z), (x2, self.roof_y(x2, z), z),
                        (x2, self.roof_y(x2, z2), z2), (x, self.roof_y(x, z2), z2)]
                zm = (z + z2) / 2
                d.polygon([d2d(*p) for p in quad], fill=int(255 * val_fn(zm)))

    def roof_shadow(self, layer, val_fn, w=0.7):
        """Тень кровли на грунте: те же нити, спроецированные на Y=0 вдоль солнца."""
        step = self.cell * 1.5
        Y = self.roof_y
        for X in np.arange(self.x0, self.x1 + 1e-6, step):
            pts = []
            for z in np.arange(self.z0, self.z1 + 1e-6, 3.0):
                sx, sz = sun_shadow(X, Y(X, z), z)
                pts.append((sx, 0.0, sz))
            mesh_line(layer, pts, w, val_fn, chunk=3)
        for Z in np.arange(self.z0, self.z1 + 1e-6, step):
            pts = []
            for x in np.arange(self.x0, self.x1 + 1e-6, 3.0):
                sx, sz = sun_shadow(x, Y(x, Z), Z)
                pts.append((sx, 0.0, sz))
            mesh_line(layer, pts, w, val_fn, chunk=3)


# --------------------------------------------------------------------------
# сборка сцены
# --------------------------------------------------------------------------

Z_NEAR = 14.0        # ближе этого полотно не рисуем: точка переходит через камеру


def compose(base, L, cfg, occl):
    """Собирает кадр: полотно/кабели/мачты — контрастом по фону, вуаль, тень."""
    arr = np.asarray(base).astype(np.float32)
    bg = np.asarray(base.filter(ImageFilter.GaussianBlur(3.0))).astype(np.float32)
    bg_lum = bg.mean(2)[:, :, None]
    lum = arr.mean(2)[:, :, None]
    noise = np.asarray(_noise_field(base.size)).astype(np.float32)[:, :, None] / 255.0
    noise = 0.82 + 0.18 * noise

    def mask(name, scale=1.0, extra=None):
        m = L[name].resize(base.size, Image.LANCZOS)
        a = np.asarray(m).astype(np.float32)[:, :, None] / 255.0
        if extra is not None:
            a = a * extra
        return a * scale

    # 1. тень полотна на траве
    if 'shadow' in cfg:
        gm = grass_mask(base)[:, :, None]
        arr *= 1.0 - mask('shadow', cfg['shadow']) * gm

    # 2. вуаль стен и плёнка кровли (полотно в скользь читается как пелена)
    if cfg.get('veil'):
        a = mask('veil', cfg['veil'])
        arr = arr * (1 - a) + np.array(cfg['veil_rgb'], dtype=np.float32) * a
    if 'film' in L:
        a = mask('film', cfg.get('film', 1.0))
        tgt = bg_lum + (128.0 - bg_lum) * 0.55
        arr = arr * (1 - a) + tgt * a

    # 3. нити и металл: цвет = фон, сдвинутый к серому по контрасту
    for name, strength, k, occ in (('net', cfg['net'], 0.95, None),
                                   ('cable', cfg['cable'], 1.0, None),
                                   ('guy', cfg['guy'], 1.0, None),
                                   ('guyN', cfg['guy'], 1.0, None),
                                   ('mast', cfg['mast'], 1.0, occl),
                                   ('mastN', cfg['mast'], 1.0, None)):
        if not strength:
            continue
        a = mask(name, strength, extra=noise if name == 'net' else None)
        if occ is not None:
            a = a * occ
        tgt = bg_lum + (128.0 - bg_lum) * k
        arr = arr * (1 - a) + tgt * a

    # 4. анкеры — плотные блоки
    if cfg.get('anchor'):
        a = mask('anchor', cfg['anchor'][0])
        arr = arr * (1 - a) + np.array(cfg['anchor'][1], dtype=np.float32) * a
    _ = lum
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def _noise_field(size):
    rng = np.random.default_rng(7)
    small = rng.integers(60, 256, size=(16, 24), dtype=np.uint8)
    return Image.fromarray(small, 'L').resize(size, Image.BICUBIC)


# --------------------------------------------------------------------------
# варианты
# --------------------------------------------------------------------------

def cfg_c1():
    """C1: камера внутри контура — видно кровлю, дальнюю стену и фланги.

    Задняя граница — Z=100 м: передний ряд дальних ячеек ОРУ. За ней остаются
    дальний ряд оборудования и опора ВЛ (её база в кадре — около Z=120 м), то есть
    защита заканчивается перед пилоном, а не уходит по линии вдаль.
    """
    zone = Zone(-29, 37, -14, 100, 26.0, mx=[-29, -12, 12, 37],
                mz=[-14, 25, 63, 100], sag_x=0.30, sag_z=0.45, cell=0.70)
    masts = []
    for z in (63, 100):
        masts.append(dict(X=-29, Z=z, g=[(-15, -9), (-15, 9)]))
        masts.append(dict(X=37, Z=z, g=[(15, -9), (15, 9)]))
    for x in (-12, 12):
        masts.append(dict(X=x, Z=100, g=[(-9, 11), (9, 11)]))
    for x in (-12, 12):
        masts.append(dict(X=x, Z=63, g=[]))
    return dict(zone=zone, walls=['L', 'R', 'B'], masts=masts, hole=None,
                strand=0.75, mast_w=0.055, guy_sag=0.9, haze=0.50,
                shadow=0.16, veil=0.050, veil_rgb=(150, 158, 166),
                net=0.50, cable=0.85, guy=0.70, mast=1.00,
                roof_fade=roof_fade, frame_w=1.4, belt_w=1.3,
                anchor=(0.80, (176, 176, 170)))


def cfg_c2():
    """C2: камера снаружи — контур над двором, кадр через фронтальную стену."""
    zone = Zone(-29, 37, 42, 126, 26.0, mx=[-29, -12, 12, 37],
                mz=[42, 62, 84, 105, 126], sag_x=0.30, sag_z=0.35)
    masts = []
    for x, g in ((-29, [(-16, -10), (-16, 10)]), (-12, [(-4, -15), (4, -15)]),
                 (12, [(-4, -15), (4, -15)]), (37, [(16, -10), (16, 10)])):
        masts.append(dict(X=x, Z=42, g=g))
    for z in (62, 84, 105, 126):
        masts.append(dict(X=-29, Z=z, g=[(-15, -9), (-15, 9)]))
        masts.append(dict(X=37, Z=z, g=[(15, -9), (15, 9)]))
    for x in (-12, 12):
        masts.append(dict(X=x, Z=126, g=[(-9, 15), (9, 15)]))
        masts.append(dict(X=x, Z=84, g=[]))
    return dict(zone=zone, walls=['L', 'R', 'B', 'F'], masts=masts, hole=None,
                strand=0.75, mast_w=0.055, guy_sag=0.9, haze=0.50,
                shadow=0.16, veil=0.062, veil_rgb=(150, 158, 166),
                net=0.52, cable=0.85, guy=0.70, mast=1.00,
                anchor=(0.80, (176, 176, 170)))


def cfg_c1_dense():
    """C1-плотный: то же, но полотно заметнее (для инженерных блоков)."""
    cfg = cfg_c1()
    cfg['zone'] = Zone(-29, 37, -14, 100, 26.0, mx=[-29, -12, 12, 37],
                       mz=[-14, 25, 63, 100], sag_x=0.30, sag_z=0.45, cell=0.55)
    cfg.update(strand=1.05, veil=0.075, net=0.62, cable=0.95, haze=0.42)
    return cfg


VARIANTS = {'c1': cfg_c1, 'c2': cfg_c2, 'c1d': cfg_c1_dense}


def cfg_c2_light():
    """C2-лёгкий: полотно тоньше — техника читается лучше (кандидат для hero)."""
    cfg = cfg_c2()
    cfg['zone'] = Zone(-29, 37, 42, 126, 26.0, mx=[-29, -12, 12, 37],
                       mz=[42, 62, 84, 105, 126], sag_x=0.30, sag_z=0.35, cell=0.80)
    cfg.update(strand=0.65, veil=0.045, net=0.42, cable=0.75)
    return cfg


VARIANTS['c2l'] = cfg_c2_light


def render(name, factory, tweaks=None, debug=False):
    cfg = factory()
    if tweaks:
        cfg.update(tweaks)
    os.makedirs(OUT_DIR, exist_ok=True)
    base = base_image()
    occl_img = build_occluder().resize(base.size, Image.LANCZOS)
    occl = np.asarray(occl_img).astype(np.float32)[:, :, None] / 255.0
    occl = 1.0 - np.clip(occl, 0, 1)          # 0 там, где стоит ближняя техника
    L = _scene_full(cfg)
    out = compose(base, L, cfg, occl)
    if debug:
        im = out.copy()
        d = ImageDraw.Draw(im)
        for m in cfg['masts']:
            x, y = p2d(m['X'], 0, m['Z'])
            d.ellipse([x * OUT - 7, y * OUT - 7, x * OUT + 7, y * OUT + 7],
                      outline=(255, 40, 40), width=2)
        im.save(os.path.join(OUT_DIR, 'dbg-%s%s.jpg' % (OUT_PREFIX, name)), quality=88)
    path = os.path.join(OUT_DIR, '%s%s.jpg' % (OUT_PREFIX, name))
    out.save(path, quality=93)
    print(name, out.size, path)
    return path


def _scene_full(cfg):
    """Сборка сцены с индивидуальными оттяжками у мачт."""
    L = {k: new_layer() for k in ('net', 'cable', 'mast', 'mastN', 'guy',
                                  'guyN', 'anchor', 'veil', 'film', 'shadow')}
    zone = cfg['zone']
    vn = lambda Z: haze(Z, k=cfg['haze'])
    vc = lambda Z: haze(Z, k=cfg['haze'] * 0.7)
    zone.roof_mesh(L, vn, w=cfg['strand'], fade=cfg.get('roof_fade'))
    zone.frame_cables(L['cable'], vc, w=cfg.get('frame_w', 1.4))
    for side in cfg['walls']:
        if side == 'F' and zone.z0 < Z_NEAR:
            continue
        zone.wall_mesh(L, side, vn, hole=cfg.get('hole') if side == 'L' else None,
                       w=cfg['strand'], fade=cfg.get('roof_fade'))
    zone.belts(L, cfg['walls'], vc, w=cfg.get('belt_w', 1.3))
    zone.veil(L, [s for s in cfg['walls'] if s != 'F' or zone.z0 >= Z_NEAR], vn)
    zone.roof_film(L['film'], lambda Z: min(0.36, max(0.06, 0.06 + 0.30 * (Z - 20.0) / 110.0)))
    if cfg.get('shadow'):
        zone.roof_shadow(L['shadow'], lambda Z: vn(Z) * 0.8)
    for m in cfg['masts']:
        X, Z = m['X'], m['Z']
        x, yb = p2d(X, 0, Z)[0], p2d(X, 0, Z)[1]
        yt = p2d(X, zone.h, Z)[1]
        if (x < -80 or x > 880) and not (yt < 531 and yb > 0):
            continue
        front = Z <= 50.0
        mast(L['mastN'] if front else L['mast'], X, Z, zone.h, w=cfg['mast_w'])
        if -80 < x < 880:
            anchor(L['anchor'], X, Z, size=cfg.get('foot', 0.95))
        for (dx, dz) in m['g']:
            ax, az = X + dx, Z + dz
            if az < 6.0:
                continue
            guy(L['guyN'] if front else L['guy'], X, Z, zone.h - 1.4, ax, az,
                sag=cfg['guy_sag'])
            if -60 < p2d(ax, 0, az)[0] < 860:
                anchor(L['anchor'], ax, az)
    return L


if __name__ == '__main__':
    import sys
    which = sys.argv[1:] or ['c1', 'c2']
    for v in which:
        render(v, VARIANTS[v])

