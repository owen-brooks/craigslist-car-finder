function QR8bitByte(a) {
  (this.mode = QRMode.MODE_8BIT_BYTE), (this.data = a);
}
function QRCode(a, b) {
  (this.typeNumber = a),
    (this.errorCorrectLevel = b),
    (this.modules = null),
    (this.moduleCount = 0),
    (this.dataCache = null),
    (this.dataList = new Array());
}
function QRPolynomial(a, b) {
  if (void 0 == a.length) throw new Error(a.length + "/" + b);
  for (var c = 0; c < a.length && 0 == a[c]; ) c++;
  this.num = new Array(a.length - c + b);
  for (var d = 0; d < a.length - c; d++) this.num[d] = a[d + c];
}
function QRRSBlock(a, b) {
  (this.totalCount = a), (this.dataCount = b);
}
function QRBitBuffer() {
  (this.buffer = new Array()), (this.length = 0);
}
(QR8bitByte.prototype = {
  getLength: function() {
    return this.data.length;
  },
  write: function(a) {
    for (var b = 0; b < this.data.length; b++)
      a.put(this.data.charCodeAt(b), 8);
  }
}),
  (QRCode.prototype = {
    addData: function(a) {
      var b = new QR8bitByte(a);
      this.dataList.push(b), (this.dataCache = null);
    },
    isDark: function(a, b) {
      if (a < 0 || this.moduleCount <= a || b < 0 || this.moduleCount <= b)
        throw new Error(a + "," + b);
      return this.modules[a][b];
    },
    getModuleCount: function() {
      return this.moduleCount;
    },
    make: function() {
      if (this.typeNumber < 1) {
        var a = 1;
        for (a = 1; a < 40; a++) {
          for (
            var b = QRRSBlock.getRSBlocks(a, this.errorCorrectLevel),
              c = new QRBitBuffer(),
              d = 0,
              e = 0;
            e < b.length;
            e++
          )
            d += b[e].dataCount;
          for (var e = 0; e < this.dataList.length; e++) {
            var f = this.dataList[e];
            c.put(f.mode, 4),
              c.put(f.getLength(), QRUtil.getLengthInBits(f.mode, a)),
              f.write(c);
          }
          if (c.getLengthInBits() <= 8 * d) break;
        }
        this.typeNumber = a;
      }
      this.makeImpl(!1, this.getBestMaskPattern());
    },
    makeImpl: function(a, b) {
      (this.moduleCount = 4 * this.typeNumber + 17),
        (this.modules = new Array(this.moduleCount));
      for (var c = 0; c < this.moduleCount; c++) {
        this.modules[c] = new Array(this.moduleCount);
        for (var d = 0; d < this.moduleCount; d++) this.modules[c][d] = null;
      }
      this.setupPositionProbePattern(0, 0),
        this.setupPositionProbePattern(this.moduleCount - 7, 0),
        this.setupPositionProbePattern(0, this.moduleCount - 7),
        this.setupPositionAdjustPattern(),
        this.setupTimingPattern(),
        this.setupTypeInfo(a, b),
        this.typeNumber >= 7 && this.setupTypeNumber(a),
        null == this.dataCache &&
          (this.dataCache = QRCode.createData(
            this.typeNumber,
            this.errorCorrectLevel,
            this.dataList
          )),
        this.mapData(this.dataCache, b);
    },
    setupPositionProbePattern: function(a, b) {
      for (var c = -1; c <= 7; c++)
        if (!(a + c <= -1 || this.moduleCount <= a + c))
          for (var d = -1; d <= 7; d++)
            b + d <= -1 ||
              this.moduleCount <= b + d ||
              (this.modules[a + c][b + d] =
                (0 <= c && c <= 6 && (0 == d || 6 == d)) ||
                (0 <= d && d <= 6 && (0 == c || 6 == c)) ||
                (2 <= c && c <= 4 && 2 <= d && d <= 4));
    },
    getBestMaskPattern: function() {
      for (var a = 0, b = 0, c = 0; c < 8; c++) {
        this.makeImpl(!0, c);
        var d = QRUtil.getLostPoint(this);
        (0 == c || a > d) && ((a = d), (b = c));
      }
      return b;
    },
    createMovieClip: function(a, b, c) {
      var d = a.createEmptyMovieClip(b, c);
      this.make();
      for (var e = 0; e < this.modules.length; e++)
        for (var f = 1 * e, g = 0; g < this.modules[e].length; g++) {
          var h = 1 * g,
            i = this.modules[e][g];
          i &&
            (d.beginFill(0, 100),
            d.moveTo(h, f),
            d.lineTo(h + 1, f),
            d.lineTo(h + 1, f + 1),
            d.lineTo(h, f + 1),
            d.endFill());
        }
      return d;
    },
    setupTimingPattern: function() {
      for (var a = 8; a < this.moduleCount - 8; a++)
        null == this.modules[a][6] && (this.modules[a][6] = a % 2 == 0);
      for (var b = 8; b < this.moduleCount - 8; b++)
        null == this.modules[6][b] && (this.modules[6][b] = b % 2 == 0);
    },
    setupPositionAdjustPattern: function() {
      for (
        var a = QRUtil.getPatternPosition(this.typeNumber), b = 0;
        b < a.length;
        b++
      )
        for (var c = 0; c < a.length; c++) {
          var d = a[b],
            e = a[c];
          if (null == this.modules[d][e])
            for (var f = -2; f <= 2; f++)
              for (var g = -2; g <= 2; g++)
                this.modules[d + f][e + g] =
                  f == -2 || 2 == f || g == -2 || 2 == g || (0 == f && 0 == g);
        }
    },
    setupTypeNumber: function(a) {
      for (
        var b = QRUtil.getBCHTypeNumber(this.typeNumber), c = 0;
        c < 18;
        c++
      ) {
        var d = !a && 1 == ((b >> c) & 1);
        this.modules[Math.floor(c / 3)][(c % 3) + this.moduleCount - 8 - 3] = d;
      }
      for (var c = 0; c < 18; c++) {
        var d = !a && 1 == ((b >> c) & 1);
        this.modules[(c % 3) + this.moduleCount - 8 - 3][Math.floor(c / 3)] = d;
      }
    },
    setupTypeInfo: function(a, b) {
      for (
        var c = (this.errorCorrectLevel << 3) | b,
          d = QRUtil.getBCHTypeInfo(c),
          e = 0;
        e < 15;
        e++
      ) {
        var f = !a && 1 == ((d >> e) & 1);
        e < 6
          ? (this.modules[e][8] = f)
          : e < 8
            ? (this.modules[e + 1][8] = f)
            : (this.modules[this.moduleCount - 15 + e][8] = f);
      }
      for (var e = 0; e < 15; e++) {
        var f = !a && 1 == ((d >> e) & 1);
        e < 8
          ? (this.modules[8][this.moduleCount - e - 1] = f)
          : e < 9
            ? (this.modules[8][15 - e - 1 + 1] = f)
            : (this.modules[8][15 - e - 1] = f);
      }
      this.modules[this.moduleCount - 8][8] = !a;
    },
    mapData: function(a, b) {
      for (
        var c = -1,
          d = this.moduleCount - 1,
          e = 7,
          f = 0,
          g = this.moduleCount - 1;
        g > 0;
        g -= 2
      )
        for (6 == g && g--; ; ) {
          for (var h = 0; h < 2; h++)
            if (null == this.modules[d][g - h]) {
              var i = !1;
              f < a.length && (i = 1 == ((a[f] >>> e) & 1));
              var j = QRUtil.getMask(b, d, g - h);
              j && (i = !i),
                (this.modules[d][g - h] = i),
                e--,
                e == -1 && (f++, (e = 7));
            }
          if ((d += c) < 0 || this.moduleCount <= d) {
            (d -= c), (c = -c);
            break;
          }
        }
    }
  }),
  (QRCode.PAD0 = 236),
  (QRCode.PAD1 = 17),
  (QRCode.createData = function(a, b, c) {
    for (
      var d = QRRSBlock.getRSBlocks(a, b), e = new QRBitBuffer(), f = 0;
      f < c.length;
      f++
    ) {
      var g = c[f];
      e.put(g.mode, 4),
        e.put(g.getLength(), QRUtil.getLengthInBits(g.mode, a)),
        g.write(e);
    }
    for (var h = 0, f = 0; f < d.length; f++) h += d[f].dataCount;
    if (e.getLengthInBits() > 8 * h)
      throw new Error(
        "code length overflow. (" + e.getLengthInBits() + ">" + 8 * h + ")"
      );
    for (
      e.getLengthInBits() + 4 <= 8 * h && e.put(0, 4);
      e.getLengthInBits() % 8 != 0;

    )
      e.putBit(!1);
    for (;;) {
      if (e.getLengthInBits() >= 8 * h) break;
      if ((e.put(QRCode.PAD0, 8), e.getLengthInBits() >= 8 * h)) break;
      e.put(QRCode.PAD1, 8);
    }
    return QRCode.createBytes(e, d);
  }),
  (QRCode.createBytes = function(a, b) {
    for (
      var c = 0,
        d = 0,
        e = 0,
        f = new Array(b.length),
        g = new Array(b.length),
        h = 0;
      h < b.length;
      h++
    ) {
      var i = b[h].dataCount,
        j = b[h].totalCount - i;
      (d = Math.max(d, i)), (e = Math.max(e, j)), (f[h] = new Array(i));
      for (var k = 0; k < f[h].length; k++) f[h][k] = 255 & a.buffer[k + c];
      c += i;
      var l = QRUtil.getErrorCorrectPolynomial(j),
        m = new QRPolynomial(f[h], l.getLength() - 1),
        n = m.mod(l);
      g[h] = new Array(l.getLength() - 1);
      for (var k = 0; k < g[h].length; k++) {
        var o = k + n.getLength() - g[h].length;
        g[h][k] = o >= 0 ? n.get(o) : 0;
      }
    }
    for (var p = 0, k = 0; k < b.length; k++) p += b[k].totalCount;
    for (var q = new Array(p), r = 0, k = 0; k < d; k++)
      for (var h = 0; h < b.length; h++) k < f[h].length && (q[r++] = f[h][k]);
    for (var k = 0; k < e; k++)
      for (var h = 0; h < b.length; h++) k < g[h].length && (q[r++] = g[h][k]);
    return q;
  });
for (
  var QRMode = {
      MODE_NUMBER: 1,
      MODE_ALPHA_NUM: 2,
      MODE_8BIT_BYTE: 4,
      MODE_KANJI: 8
    },
    QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 },
    QRMaskPattern = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    },
    QRUtil = {
      PATTERN_POSITION_TABLE: [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
      ],
      G15: 1335,
      G18: 7973,
      G15_MASK: 21522,
      getBCHTypeInfo: function(a) {
        for (
          var b = a << 10;
          QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G15) >= 0;

        )
          b ^=
            QRUtil.G15 <<
            (QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G15));
        return ((a << 10) | b) ^ QRUtil.G15_MASK;
      },
      getBCHTypeNumber: function(a) {
        for (
          var b = a << 12;
          QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G18) >= 0;

        )
          b ^=
            QRUtil.G18 <<
            (QRUtil.getBCHDigit(b) - QRUtil.getBCHDigit(QRUtil.G18));
        return (a << 12) | b;
      },
      getBCHDigit: function(a) {
        for (var b = 0; 0 != a; ) b++, (a >>>= 1);
        return b;
      },
      getPatternPosition: function(a) {
        return QRUtil.PATTERN_POSITION_TABLE[a - 1];
      },
      getMask: function(a, b, c) {
        switch (a) {
          case QRMaskPattern.PATTERN000:
            return (b + c) % 2 == 0;
          case QRMaskPattern.PATTERN001:
            return b % 2 == 0;
          case QRMaskPattern.PATTERN010:
            return c % 3 == 0;
          case QRMaskPattern.PATTERN011:
            return (b + c) % 3 == 0;
          case QRMaskPattern.PATTERN100:
            return (Math.floor(b / 2) + Math.floor(c / 3)) % 2 == 0;
          case QRMaskPattern.PATTERN101:
            return ((b * c) % 2) + ((b * c) % 3) == 0;
          case QRMaskPattern.PATTERN110:
            return (((b * c) % 2) + ((b * c) % 3)) % 2 == 0;
          case QRMaskPattern.PATTERN111:
            return (((b * c) % 3) + ((b + c) % 2)) % 2 == 0;
          default:
            throw new Error("bad maskPattern:" + a);
        }
      },
      getErrorCorrectPolynomial: function(a) {
        for (var b = new QRPolynomial([1], 0), c = 0; c < a; c++)
          b = b.multiply(new QRPolynomial([1, QRMath.gexp(c)], 0));
        return b;
      },
      getLengthInBits: function(a, b) {
        if (1 <= b && b < 10)
          switch (a) {
            case QRMode.MODE_NUMBER:
              return 10;
            case QRMode.MODE_ALPHA_NUM:
              return 9;
            case QRMode.MODE_8BIT_BYTE:
              return 8;
            case QRMode.MODE_KANJI:
              return 8;
            default:
              throw new Error("mode:" + a);
          }
        else if (b < 27)
          switch (a) {
            case QRMode.MODE_NUMBER:
              return 12;
            case QRMode.MODE_ALPHA_NUM:
              return 11;
            case QRMode.MODE_8BIT_BYTE:
              return 16;
            case QRMode.MODE_KANJI:
              return 10;
            default:
              throw new Error("mode:" + a);
          }
        else {
          if (!(b < 41)) throw new Error("type:" + b);
          switch (a) {
            case QRMode.MODE_NUMBER:
              return 14;
            case QRMode.MODE_ALPHA_NUM:
              return 13;
            case QRMode.MODE_8BIT_BYTE:
              return 16;
            case QRMode.MODE_KANJI:
              return 12;
            default:
              throw new Error("mode:" + a);
          }
        }
      },
      getLostPoint: function(a) {
        for (var b = a.getModuleCount(), c = 0, d = 0; d < b; d++)
          for (var e = 0; e < b; e++) {
            for (var f = 0, g = a.isDark(d, e), h = -1; h <= 1; h++)
              if (!(d + h < 0 || b <= d + h))
                for (var i = -1; i <= 1; i++)
                  e + i < 0 ||
                    b <= e + i ||
                    (0 == h && 0 == i) ||
                    (g == a.isDark(d + h, e + i) && f++);
            f > 5 && (c += 3 + f - 5);
          }
        for (var d = 0; d < b - 1; d++)
          for (var e = 0; e < b - 1; e++) {
            var j = 0;
            a.isDark(d, e) && j++,
              a.isDark(d + 1, e) && j++,
              a.isDark(d, e + 1) && j++,
              a.isDark(d + 1, e + 1) && j++,
              (0 != j && 4 != j) || (c += 3);
          }
        for (var d = 0; d < b; d++)
          for (var e = 0; e < b - 6; e++)
            a.isDark(d, e) &&
              !a.isDark(d, e + 1) &&
              a.isDark(d, e + 2) &&
              a.isDark(d, e + 3) &&
              a.isDark(d, e + 4) &&
              !a.isDark(d, e + 5) &&
              a.isDark(d, e + 6) &&
              (c += 40);
        for (var e = 0; e < b; e++)
          for (var d = 0; d < b - 6; d++)
            a.isDark(d, e) &&
              !a.isDark(d + 1, e) &&
              a.isDark(d + 2, e) &&
              a.isDark(d + 3, e) &&
              a.isDark(d + 4, e) &&
              !a.isDark(d + 5, e) &&
              a.isDark(d + 6, e) &&
              (c += 40);
        for (var k = 0, e = 0; e < b; e++)
          for (var d = 0; d < b; d++) a.isDark(d, e) && k++;
        return (c += (Math.abs((100 * k) / b / b - 50) / 5) * 10);
      }
    },
    QRMath = {
      glog: function(a) {
        if (a < 1) throw new Error("glog(" + a + ")");
        return QRMath.LOG_TABLE[a];
      },
      gexp: function(a) {
        for (; a < 0; ) a += 255;
        for (; a >= 256; ) a -= 255;
        return QRMath.EXP_TABLE[a];
      },
      EXP_TABLE: new Array(256),
      LOG_TABLE: new Array(256)
    },
    i = 0;
  i < 8;
  i++
)
  QRMath.EXP_TABLE[i] = 1 << i;
for (var i = 8; i < 256; i++)
  QRMath.EXP_TABLE[i] =
    QRMath.EXP_TABLE[i - 4] ^
    QRMath.EXP_TABLE[i - 5] ^
    QRMath.EXP_TABLE[i - 6] ^
    QRMath.EXP_TABLE[i - 8];
for (var i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
(QRPolynomial.prototype = {
  get: function(a) {
    return this.num[a];
  },
  getLength: function() {
    return this.num.length;
  },
  multiply: function(a) {
    for (
      var b = new Array(this.getLength() + a.getLength() - 1), c = 0;
      c < this.getLength();
      c++
    )
      for (var d = 0; d < a.getLength(); d++)
        b[c + d] ^= QRMath.gexp(
          QRMath.glog(this.get(c)) + QRMath.glog(a.get(d))
        );
    return new QRPolynomial(b, 0);
  },
  mod: function(a) {
    if (this.getLength() - a.getLength() < 0) return this;
    for (
      var b = QRMath.glog(this.get(0)) - QRMath.glog(a.get(0)),
        c = new Array(this.getLength()),
        d = 0;
      d < this.getLength();
      d++
    )
      c[d] = this.get(d);
    for (var d = 0; d < a.getLength(); d++)
      c[d] ^= QRMath.gexp(QRMath.glog(a.get(d)) + b);
    return new QRPolynomial(c, 0).mod(a);
  }
}),
  (QRRSBlock.RS_BLOCK_TABLE = [
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12],
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16]
  ]),
  (QRRSBlock.getRSBlocks = function(a, b) {
    var c = QRRSBlock.getRsBlockTable(a, b);
    if (void 0 == c)
      throw new Error(
        "bad rs block @ typeNumber:" + a + "/errorCorrectLevel:" + b
      );
    for (var d = c.length / 3, e = new Array(), f = 0; f < d; f++)
      for (
        var g = c[3 * f + 0], h = c[3 * f + 1], i = c[3 * f + 2], j = 0;
        j < g;
        j++
      )
        e.push(new QRRSBlock(h, i));
    return e;
  }),
  (QRRSBlock.getRsBlockTable = function(a, b) {
    switch (b) {
      case QRErrorCorrectLevel.L:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 0];
      case QRErrorCorrectLevel.M:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 1];
      case QRErrorCorrectLevel.Q:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 2];
      case QRErrorCorrectLevel.H:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (a - 1) + 3];
      default:
        return;
    }
  }),
  (QRBitBuffer.prototype = {
    get: function(a) {
      var b = Math.floor(a / 8);
      return 1 == ((this.buffer[b] >>> (7 - (a % 8))) & 1);
    },
    put: function(a, b) {
      for (var c = 0; c < b; c++) this.putBit(1 == ((a >>> (b - c - 1)) & 1));
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(a) {
      var b = Math.floor(this.length / 8);
      this.buffer.length <= b && this.buffer.push(0),
        a && (this.buffer[b] |= 128 >>> this.length % 8),
        this.length++;
    }
  }),
  (function(a) {
    a.fn.qrcode = function(b) {
      "string" == typeof b && (b = { text: b }),
        (b = a.extend(
          {},
          {
            render: "canvas",
            width: 256,
            height: 256,
            typeNumber: -1,
            correctLevel: QRErrorCorrectLevel.H,
            background: "#ffffff",
            foreground: "#000000"
          },
          b
        ));
      var c = function() {
          var a = new QRCode(b.typeNumber, b.correctLevel);
          a.addData(b.text), a.make();
          var c = document.createElement("canvas");
          (c.width = b.width), (c.height = b.height);
          for (
            var d = c.getContext("2d"),
              e = b.width / a.getModuleCount(),
              f = b.height / a.getModuleCount(),
              g = 0;
            g < a.getModuleCount();
            g++
          )
            for (var h = 0; h < a.getModuleCount(); h++) {
              d.fillStyle = a.isDark(g, h) ? b.foreground : b.background;
              var i = Math.ceil((h + 1) * e) - Math.floor(h * e),
                j = Math.ceil((g + 1) * e) - Math.floor(g * e);
              d.fillRect(Math.round(h * e), Math.round(g * f), i, j);
            }
          return c;
        },
        d = function() {
          var c = new QRCode(b.typeNumber, b.correctLevel);
          c.addData(b.text), c.make();
          for (
            var d = a("<table></table>")
                .css("width", b.width + "px")
                .css("height", b.height + "px")
                .css("border", "0px")
                .css("border-collapse", "collapse")
                .css("background-color", b.background),
              e = b.width / c.getModuleCount(),
              f = b.height / c.getModuleCount(),
              g = 0;
            g < c.getModuleCount();
            g++
          )
            for (
              var h = a("<tr></tr>")
                  .css("height", f + "px")
                  .appendTo(d),
                i = 0;
              i < c.getModuleCount();
              i++
            )
              a("<td></td>")
                .css("width", e + "px")
                .css(
                  "background-color",
                  c.isDark(g, i) ? b.foreground : b.background
                )
                .appendTo(h);
          return d;
        };
      return this.each(function() {
        a("canvas" == b.render ? c() : d()).appendTo(this);
      });
    };
  })(jQuery),
  (window.mapsConfig = {
    1: {
      defaultLat: 37.762496,
      defaultLng: -122.466341,
      southWest: [36.54, -120.3],
      northEast: [38.51, -123.23]
    },
    9: {
      defaultLat: 45.523187,
      defaultLng: -122.681424,
      southWest: [46.346, -124.272],
      northEast: [44, -121]
    }
  }),
  (function() {
    var a = $("#map.viewposting");
    if (a.length) {
      var b = a.data("latitude"),
        c = a.data("longitude"),
        d = a.data("accuracy") + 0;
      if (b && c) {
        L.Icon.Default.imagePath = "//www.craigslist.org/images/map/";
        var e = new L.LatLng(b, c),
          f = new L.TileLayer(CL.maps.clMapsUrl, {
            subdomains: "0123456789",
            setView: !0,
            enableHighAccuracy: !0,
            prefix: "",
            attribution:
              '&copy; craigslist - Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }),
          g = 14;
        d > 19 && (g = 13);
        var h = new L.Map("map", {
          center: e,
          zoom: g,
          zoomControl: !1,
          maxZoom: 17,
          minZoom: 1,
          maxBounds: [[-90, -180], [90, 180]],
          layers: [f]
        });
        if (
          ((CL.maps.map = h),
          h.attributionControl.setPrefix(""),
          d > 19
            ? L.circle(e, 1500, {
                color: "#770091",
                weight: 1,
                fillOpacity: 0.1
              }).addTo(h)
            : L.marker(e, { draggable: !1 }).addTo(h),
          CL.page.isMobile && $("body.post").length)
        )
          h.dragging.disable(),
            h.touchZoom.disable(),
            h.doubleClickZoom.disable(),
            h.scrollWheelZoom.disable(),
            h.boxZoom.disable(),
            h.keyboard.disable(),
            a
              .prepend('<div class="mapglass"></div>')
              .find(".mapglass")
              .on("touchstart touchmove", function(a) {
                a.stopImmediatePropagation();
              });
        else {
          var i = L.Control.ZoomFS || L.Control.Zoom;
          h.addControl(new i());
        }
      }
    }
  })(),
  (function() {
    if (0 !== $("body.posting, body.post, body.best").length) {
      var a = $("body"),
        b = $(".banished_count");
      if (CL.browser.canvas) {
        var c = $(".print-qrcode:empty");
        c.qrcode({ width: 200, height: 200, text: c.data("location") });
      }
      var d = function() {
          var a = $(".reply-email-address").text(),
            b = $(".reply-tel-number").text();
          a.length > 0 && $(".print-email").text(a),
            b.length > 0 && $(".print-phone").text(b);
        },
        e = function() {
          if ($(".reply-flap").length > 0) d();
          else {
            var a = $("#replylink").attr("href");
            $(".returnemail").load(a, function() {
              d();
            });
          }
          var b = $(".showcontact").attr("href");
          b && CL.page.showContactInfo(b);
          var c = $("#thumbs img.selected")
              .parent()
              .index(),
            e = [],
            f = window.imgList || [];
          f.forEach(function(a, b) {
            if (b !== c && 1 !== f.length) {
              var d = new Image();
              (d.src = a.url), e.push(d);
            }
          }),
            0 === $(".print-pics").children().length &&
              $(".print-pics").append(e);
        };
      if (CL.browser.matchMedia) {
        var f = window.matchMedia("print"),
          g = function(a) {
            a.matches && e();
          };
        f.addListener(g), g(f);
      }
      (window.onbeforeprint = e),
        $("#printme").on("click", function(a) {
          a.preventDefault(), setTimeout(window.print, 800);
        }),
        CL.when.localStorageAvailable.done(function() {
          var c = CL.searchStream.fetch(),
            d = window.pID;
          if (c) {
            var e = c.curSearch();
            CL.banish.isBanished(window.pID)
              ? $(".postingtitle").addClass("banished")
              : $(".postingtitle").removeClass("banished"),
              $(".unbanish").on("click", function() {
                CL.banish.unban(d),
                  b.text(CL.banish.banishedCount()),
                  $(".postingtitle").removeClass("banished"),
                  a.removeClass("is-banished");
                var c = "/flag/?async=async&flagCode=36&postingID=" + d;
                $.get(c);
              }),
              $(".banish").on("click", function() {
                CL.banish.ban(d),
                  b.text(CL.banish.banishedCount()),
                  $(".postingtitle").addClass("banished"),
                  a.addClass("is-banished");
                var c = "/flag/?async=async&flagCode=37&postingID=" + d;
                $.get(c);
              }),
              CL.banish.events.on("banish unbanish", function() {
                a.toggleClass("has-banished", CL.banish.banishedCount() > 0);
              }),
              $("#has_been_removed").length && CL.banish.ban(d);
            var f = $(".prevnext a");
            if (c.hasPosting(d)) {
              c.getPostings(d, -1, function(a) {
                if (a.length > 0) {
                  var b = a[0][2];
                  $(".prev").attr({ href: a[0][1], title: b }), f.show();
                }
              }),
                c.getPostings(d, 1, function(a) {
                  if (a.length > 0) {
                    var b = a[0][2];
                    $(".next").attr({ href: a[0][1], title: b }), f.show();
                  }
                });
              var g = c.searchLink(c.pag4pid(d));
              $(".backup").attr("href", g),
                $(".next").on("click", function() {
                  c.setSearch(e);
                }),
                $(".prev").on("click", function() {
                  c.setSearch(e);
                }),
                $(".prevnext").addClass("show-prevnext");
            }
          }
        });
      var h = $(".flaglink"),
        i = $(".bestof-link");
      CL.page.isMobile && $(".mapbox").insertAfter("#postingbody"),
        window.pID &&
          (h.on("click", function(c) {
            c.preventDefault();
            var d = window.pID;
            $(".flags").addClass("done"),
              h.contents().unwrap(),
              $.get(
                "/flag/?async=async&flagCode=" +
                  $(this).data("flag") +
                  "&postingID=" +
                  d
              ).done(function(a) {
                h.find(".flagtext").text(a);
              }),
              CL.browser.localStorage &&
                (CL.banish.ban(d),
                b.text(CL.banish.banishedCount()),
                $(".postingtitle").addClass("banished"),
                a.addClass("is-banished"));
          }),
          i.on("click", function(a) {
            a.preventDefault(),
              i.hasClass("disabled") ||
                (i.contents().unwrap(),
                $(".bestof-icon").addClass("done"),
                $.get(
                  "/flag/?async=async&flagCode=" +
                    $(this).data("flag") +
                    "&postingID=" +
                    window.pID
                ));
          }));
      var j = $("time"),
        k = j.parent(".postinginfo");
      j.on("click", function() {
        j.each(function() {
          var a = $(this),
            b = a.text();
          a.text(a.attr("title"))
            .attr("title", b)
            .toggleClass("abs");
        });
      }),
        k.each(function() {
          $(this).css("opacity", 1);
        });
      var l = $(".returnemail"),
        m = $(".reply_button"),
        n = $(".showcontact"),
        o = $("#postingbody");
      if (!window.bestOf) {
        var p = $('<div id="afd"></div>');
        a.prepend(p);
        var q,
          r,
          s,
          t,
          u,
          v = !1,
          w = !1,
          x = !1,
          y = CL.lightbox,
          z = function() {
            var a = $(".anonemail")[0];
            if (a) {
              var b,
                c = document;
              if (c.body.createTextRange)
                (b = c.body.createTextRange()),
                  b.moveToElementText(a),
                  b.select();
              else if (window.getSelection) {
                var d = window.getSelection();
                (b = c.createRange()),
                  b.selectNodeContents(a),
                  d.removeAllRanges(),
                  d.addRange(b);
              }
            }
          },
          A = function(a) {
            p.html(a);
            var b = p.find(".posting_body");
            b.length > 0
              ? q.html(b.html())
              : ((b = p.find(".js-captcha")),
                b.length > 0 ? q.html(b) : q.html(a)),
              q.not(":visible") && (q.show(), (x = !0)),
              p.html(""),
              y.close(),
              (w = !0),
              z();
          },
          B = function(a) {
            var b = $.parseHTML(a),
              c = $('input[name="n"]', b);
            c && (s = c.attr("value")),
              (c = $('input[name="site_key"]', b)),
              c && (t = c.attr("value")),
              (c = $('input[name="error"]', b)) && (u = c.attr("value"));
          };
        (CL.page.gRecaptchaVerifyCallback = function(a) {
          $.post(r, { "g-recaptcha-response": a, n: s }, function(a) {
            if (a.indexOf("standalone_captcha") >= 0) return void y(u);
            A(a);
          }).fail(function() {
            y("sorry, something went wrong");
          });
        }),
          (window.gRecaptchaCallback = function() {
            window.grecaptcha.render("g-recaptcha", {
              sitekey: t,
              callback: CL.page.gRecaptchaVerifyCallback,
              size: "invisible"
            }),
              y.scrollWithDocument().center(),
              window.grecaptcha.execute();
          });
        var C = function(b) {
            if (b.indexOf("standalone_captcha") >= 0)
              return (
                y('<div id="g-recaptcha" class="captcha_form"></div>', {
                  position: "absolute"
                }),
                B(b),
                a.prepend(
                  '<script src="https://www.google.com/recaptcha/api.js?onload=gRecaptchaCallback&render=explicit" async defer></script>'
                ),
                void (v = !0)
              );
            A(b);
          },
          D = !1,
          E = function(a, b, c) {
            if (!D) {
              if (((q = c), (r = b), v))
                return (
                  w &&
                    (window.grecaptcha.reset(),
                    (w = !1),
                    window.grecaptcha.execute()),
                  void y(null, { keepContent: !0 })
                );
              (D = !0),
                $.get(r, function(a) {
                  (D = !1), C(a);
                }).fail(function() {
                  (D = !1), y("sorry, something went wrong");
                });
            }
          };
        m.length &&
          (l.hide(),
          m.on("click", function(a) {
            return (
              a.stopPropagation(),
              l.html().length > 0
                ? ((x = !x), void l.toggle())
                : E(0, $("#replylink").attr("href"), l)
            );
          }),
          a.click(function(a) {
            x && !$(a.target).closest(l).length && (l.hide(), (x = !1));
          })),
          n.length &&
            n.on("click", function(a) {
              return (
                a.preventDefault(), E(0, $(".showcontact").attr("href"), o)
              );
            });
      }
      !(function() {
        var a = new Date();
        a.setHours(0),
          a.setMinutes(0),
          a.setSeconds(0),
          a.setMilliseconds(0),
          $(".property_date").each(function() {
            var b = $(this),
              c = b
                .data("date")
                .toString()
                .split("-");
            new Date(c[0], c[1] - 1, c[2]) <= a &&
              b.addClass("attr_is_today").text(b.data("today_msg"));
          });
      })();
      var F = $(".swipe"),
        G = F.find(".swipe-wrap"),
        H = G.find(".slide"),
        I = {};
      Array.isArray(window.imgList) &&
        window.imgList.forEach(function(a) {
          I[a.shortid] = a;
        });
      var J,
        K,
        L = function(a, b) {
          var c = $("<picture></picture>");
          return (
            "medium" === b &&
              $("<source>")
                .attr({ srcset: [CL.image.url(a, "medium")].join(", ") })
                .appendTo(c),
            $("<img>")
              .attr({ src: CL.image.url(a, b) })
              .appendTo(c),
            c
          );
        },
        M = !1,
        N = 0,
        O = CL.browser.touchCapable ? 150 : -1;
      window.imgList && window.imgList[0].imgid.search(/^0:/) === -1
        ? G.on("click", "img", function() {
            var a,
              b,
              c,
              d,
              e = {},
              f = window.innerWidth,
              g = window.innerHeight,
              h =
                (!CL.browser.matchMedia && screen.width < 768) ||
                (CL.browser.matchMedia &&
                  matchMedia("(max-width: 767px)").matches);
            if (CL.browser.touchCapable && h)
              return void (window.location.href = CL.image.url(
                window.imgList[N].imgid,
                "large"
              ));
            if (J) K.slide(N, 0);
            else {
              (J = $(".gallery")
                .clone()
                .addClass("big")),
                2 === window.imgList.length && J.find(".slide:gt(1)").remove(),
                (c = Math.min(1200, f - 50)),
                (d = Math.min(900, g - 40));
              var i = $("<div></div>")
                .width(1200)
                .height(900)
                .scaleToFit({ width: c, height: d });
              (a = i.width()),
                (b = i.height()),
                J.css({ overflow: "hidden", width: a + "px", height: b + "px" })
                  .find(".slide")
                  .each(function(c, d) {
                    var e = $(d).empty(),
                      f = e.data("imgid");
                    e.append(
                      L(I[f].imgid, "large")
                        .find("img")
                        .css({ "max-width": a + "px", "max-height": b + "px" })
                    );
                  });
            }
            $.extend(e, {
              afterOpen: function() {
                (K = CL.swipe.makeGallery(".lbcontent", {
                  startSlide: N,
                  speed: O
                })),
                  J.on("click", ".swipe-wrap", function() {
                    K.next();
                  }),
                  (M = !0);
              },
              afterClose: function() {
                M = !1;
              }
            }),
              CL.lightbox(J, e),
              $(window).on("orientationchange", function() {
                setTimeout(function() {
                  CL.lightbox.center();
                }, 100);
              });
          })
        : F.css({ cursor: "default" }),
        a.on("keydown.gallery", function(a) {
          var b = M ? K : R;
          b && (39 === a.keyCode ? b.next() : 37 === a.keyCode && b.prev());
        });
      var P = $(".iw"),
        Q = !1,
        R = CL.swipe.makeGallery(P, {
          speed: O,
          callback: function(a) {
            if ((T(a), (N = a), !Q)) {
              var b = window.imgList;
              H.each(function(a) {
                0 !== a &&
                  $(this)
                    .empty()
                    .append(L((b[a] || b[a - 2]).imgid, "medium"));
              }),
                (Q = !0);
            }
          }
        });
      (H = $(".slide")),
        CL.banish.ready.done(function() {
          var c = CL.banish.banishedCount();
          $(".unfaves").attr("value", CL.banish.encode()),
            b.text(c),
            a.toggleClass("has-banished", c > 0),
            $(".to-banish-page-link")
              .off("click")
              .on("click", function(a) {
                a.stopPropagation(),
                  a.preventDefault(),
                  $(".unfavform").submit();
              });
        });
      var S = $("#thumbs"),
        T = function(a) {
          S.find(".selected").removeClass("selected"),
            S.find(".thumb")
              .eq(a)
              .find("img")
              .addClass("selected");
        };
      S.on("touchstart touchend click mouseover", ".thumb", function(a) {
        "click" === a.type
          ? a.preventDefault()
          : "touchend" === a.type && (a.stopPropagation(), a.preventDefault());
        var b = $(this).index();
        R.slide(b), T(b);
      });
    }
  })();
/* {"sources":{"postings-concat.js":"0c5e5168f7b710593df2be14255882bf"}} */
