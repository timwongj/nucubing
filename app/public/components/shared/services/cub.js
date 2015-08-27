(function() {

  'use strict';

  function CubFactory() {

    var COLORS = {
      'WHITE': '#FFFFFF',
      'YELLOW': '#FFFF00',
      'ORANGE': '#FF8000',
      'RED': '#FF0000',
      'GREEN': '#00FF00',
      'BLUE': '#0000FF'
    };

    var Cub = function() {
      var self = this;
      var faceColors = [
        { face: ['U', 'UR', 'UF', 'UL', 'UB', 'URF', 'UFL', 'ULB', 'UBR'], color: COLORS.WHITE },
        { face: ['D', 'DR', 'DF', 'DL', 'DB', 'DFR', 'DLF', 'DBL', 'DRB'], color: COLORS.YELLOW },
        { face: ['L', 'LU', 'LD', 'LF', 'LB', 'LUF', 'LBU', 'LFD', 'LDB'], color: COLORS.ORANGE },
        { face: ['R', 'RU', 'RD', 'RF', 'RB', 'RFU', 'RUB', 'RDF', 'RBD'], color: COLORS.RED },
        { face: ['F', 'FU', 'FD', 'FL', 'FR', 'FUR', 'FLU', 'FRD', 'FDL'], color: COLORS.GREEN },
        { face: ['B', 'BU', 'BD', 'BL', 'BR', 'BUL', 'BRU', 'BLD', 'BDR'], color: COLORS.BLUE }
      ];
      angular.forEach(faceColors, function(faceColor) {
        angular.forEach(faceColor.face, function(sticker) {
          self[sticker] = faceColor.color;
        });
      });
    };

    /**
     * Performs a string of moves on the cub.
     * @param {string} moves - The moves to perform.
     */
    Cub.prototype.perform = function(moves) {
      var stickers, temp, movesArray = moves.split(" "), moveCount = 0, self = this;
      angular.forEach(movesArray, function(move) {
        var face = (move.substr(0, 1) === '[') ? face = move.substr(1, move.length - 2) : move.substr(0, 1);
        var dir = (move.length === 1) ? 1 : ((move.substr(1, 2) === '2') ? 2 : -1);
        switch(face) {
          case 'U': stickers = [['UR', 'UB', 'UL', 'UF'], ['RU', 'BU', 'LU', 'FU'],
            ['URF', 'UBR', 'ULB', 'UFL'], ['RFU', 'BRU', 'LBU', 'FLU'], ['FUR', 'RUB', 'BUL', 'LUF']];
            moveCount += 1; break;
          case 'D': stickers = [['DR', 'DF', 'DL', 'DB'], ['RD', 'FD', 'LD', 'BD'],
            ['DFR', 'DLF', 'DBL', 'DRB'], ['RDF', 'FDL', 'LDB', 'BDR'], ['LFD', 'BLD', 'RBD', 'FRD']];
            moveCount += 1; break;
          case 'L': stickers = [['LU', 'LB', 'LD', 'LF'], ['UL', 'BL', 'DL', 'FL'],
            ['LUF', 'LBU', 'LDB', 'LFD'], ['UFL', 'BUL', 'DBL', 'FDL'], ['FLU', 'ULB', 'BLD', 'DLF']];
            moveCount += 1; break;
          case 'R': stickers = [['RU', 'RF', 'RD', 'RB'], ['UR', 'FR', 'DR', 'BR'],
            ['RFU', 'RDF', 'RBD', 'RUB'], ['URF', 'FRD', 'DRB', 'BRU'], ['FUR', 'DFR', 'BDR', 'UBR']];
            moveCount += 1; break;
          case 'F': stickers = [['FU', 'FL', 'FD', 'FR'], ['UF', 'LF', 'DF', 'RF'],
            ['FUR', 'FLU', 'FDL', 'FRD'], ['URF', 'LUF', 'DLF', 'RDF'], ['RFU', 'UFL', 'LFD', 'DFR']];
            moveCount += 1; break;
          case 'B': stickers = [['BU', 'BR', 'BD', 'BL'], ['UB', 'RB', 'DB', 'LB'],
            ['BRU', 'BDR', 'BLD', 'BUL'], ['UBR', 'RBD', 'DBL', 'LBU'], ['RUB', 'DRB', 'LDB', 'ULB']];
            moveCount += 1; break;
          case 'x':
          case 'r': stickers = [['LU', 'LF', 'LD', 'LB'], ['UL', 'FL', 'DL', 'BL'],
            ['LUF', 'LFD', 'LDB', 'LBU'], ['UFL', 'FDL', 'DBL', 'BUL'], ['FLU', 'DLF', 'BLD', 'ULB'],
            ['U', 'F', 'D', 'B'], ['UF', 'FD', 'DB', 'BU'], ['FU', 'DF', 'BD', 'UB'],
            ['RU', 'RF', 'RD', 'RB'], ['UR', 'FR', 'DR', 'BR'],
            ['RFU', 'RDF', 'RBD', 'RUB'], ['URF', 'FRD', 'DRB', 'BRU'], ['FUR', 'DFR', 'BDR', 'UBR']];
            break;
          case 'y':
          case 'u': stickers = [['UR', 'UB', 'UL', 'UF'], ['RU', 'BU', 'LU', 'FU'],
            ['URF', 'UBR', 'ULB', 'UFL'], ['RFU', 'BRU', 'LBU', 'FLU'], ['FUR', 'RUB', 'BUL', 'LUF'],
            ['F', 'R', 'B', 'L'], ['FR', 'RB', 'BL', 'LF'], ['RF', 'BR', 'LB', 'FL'],
            ['DR', 'DB', 'DL', 'DF'], ['RD', 'BD', 'LD', 'FD'],
            ['DFR', 'DRB', 'DBL', 'DLF'], ['RDF', 'BDR', 'LDB', 'FDL'], ['LFD', 'FRD', 'RBD', 'BLD']];
            break;
          case 'z':
          case 'f': stickers = [['FU', 'FL', 'FD', 'FR'], ['UF', 'LF', 'DF', 'RF'],
            ['FUR', 'FLU', 'FDL', 'FRD'], ['URF', 'LUF', 'DLF', 'RDF'], ['RFU', 'UFL', 'LFD', 'DFR'],
            ['U', 'L', 'D', 'R'], ['UR', 'LU', 'DL', 'RD'], ['RU', 'UL', 'LD', 'DR'],
            ['BU', 'BL', 'BD', 'BR'], ['UB', 'LB', 'DB', 'RB'],
            ['BRU', 'BUL', 'BLD', 'BDR'], ['UBR', 'LBU', 'DBL', 'RBD'], ['RUB', 'ULB', 'LDB', 'DRB']];
            break;
          case 'Uw': stickers = [['UR', 'UB', 'UL', 'UF'], ['RU', 'BU', 'LU', 'FU'],
            ['URF', 'UBR', 'ULB', 'UFL'], ['RFU', 'BRU', 'LBU', 'FLU'], ['FUR', 'RUB', 'BUL', 'LUF'],
            ['F', 'R', 'B', 'L'], ['FR', 'RB', 'BL', 'LF'], ['RF', 'BR', 'LB', 'FL']];
            moveCount += 1; break;
          case 'Dw': stickers = [['DR', 'DF', 'DL', 'DB'], ['RD', 'FD', 'LD', 'BD'],
            ['DFR', 'DLF', 'DBL', 'DRB'], ['RDF', 'FDL', 'LDB', 'BDR'], ['LFD', 'BLD', 'RBD', 'FRD'],
            ['F', 'L', 'B', 'R'], ['FR', 'LF', 'BL', 'RB'], ['RF', 'FL', 'LB', 'BR']];
            moveCount += 1; break;
          case 'Lw': stickers = [['LU', 'LB', 'LD', 'LF'], ['UL', 'BL', 'DL', 'FL'],
            ['LUF', 'LBU', 'LDB', 'LFD'], ['UFL', 'BUL', 'DBL', 'FDL'], ['FLU', 'ULB', 'BLD', 'DLF'],
            ['U', 'B', 'D', 'F'], ['UF', 'BU', 'DB', 'FD'], ['FU', 'UB', 'BD', 'DF']];
            moveCount += 1; break;
          case 'Rw': stickers = [['RU', 'RF', 'RD', 'RB'], ['UR', 'FR', 'DR', 'BR'],
            ['RFU', 'RDF', 'RBD', 'RUB'], ['URF', 'FRD', 'DRB', 'BRU'], ['FUR', 'DFR', 'BDR', 'UBR'],
            ['U', 'F', 'D', 'B'], ['UF', 'FD', 'DB', 'BU'], ['FU', 'DF', 'BD', 'UB']];
            moveCount += 1; break;
          case 'Fw': stickers = [['FU', 'FL', 'FD', 'FR'], ['UF', 'LF', 'DF', 'RF'],
            ['FUR', 'FLU', 'FDL', 'FRD'], ['URF', 'LUF', 'DLF', 'RDF'], ['RFU', 'UFL', 'LFD', 'DFR'],
            ['U', 'L', 'D', 'R'], ['UR', 'LU', 'DL', 'RD'], ['RU', 'UL', 'LD', 'DR']];
            moveCount += 1; break;
          case 'Bw': stickers = [['BU', 'BR', 'BD', 'BL'], ['UB', 'RB', 'DB', 'LB'],
            ['BRU', 'BDR', 'BLD', 'BUL'], ['UBR', 'RBD', 'DBL', 'LBU'], ['RUB', 'DRB', 'LDB', 'ULB'],
            ['U', 'R', 'D', 'L'], ['UR', 'RD', 'DL', 'LU'], ['RU', 'DR', 'LD', 'UL']];
            moveCount += 1; break;
        }
        angular.forEach(stickers, function(sticker) {
          switch(dir) {
            case 1:
              temp = self[sticker[0]];
              self[sticker[0]] = self[sticker[1]];
              self[sticker[1]] = self[sticker[2]];
              self[sticker[2]] = self[sticker[3]];
              self[sticker[3]] = temp;
              break;
            case 2:
              temp = self[sticker[0]];
              self[sticker[0]] = self[sticker[2]];
              self[sticker[2]] = temp;
              temp = self[sticker[1]];
              self[sticker[1]] = self[sticker[3]];
              self[sticker[3]] = temp;
              break;
            case -1:
              temp = self[sticker[0]];
              self[sticker[0]] = self[sticker[3]];
              self[sticker[3]] = self[sticker[2]];
              self[sticker[2]] = self[sticker[1]];
              self[sticker[1]] = temp;
              break;
          }
        });
      });
      return moveCount;
    };

    /**
     * Determines whether or not the cub is solved.
     * @returns {boolean} - Returns true if the cub is solved and false otherwise.
     */
    Cub.prototype.isSolved = function() {
      return ((this.UR == this.U) && (this.RU == this.R) && (this.UF == this.U) && (this.FU == this.F) &&
      (this.UL == this.U) && (this.LU == this.L) && (this.UB == this.U) && (this.BU == this.B) &&
      (this.DR == this.D) && (this.RD == this.R) && (this.DF == this.D) && (this.FD == this.F) &&
      (this.DL == this.D) && (this.LD == this.L) && (this.DB == this.D) && (this.BD == this.B) &&
      (this.FL == this.F) && (this.LF == this.L) && (this.FR == this.F) && (this.RF == this.R) &&
      (this.BL == this.B) && (this.LB == this.L) && (this.BR == this.B) && (this.RB == this.R) &&
      (this.URF == this.U) && (this.RFU == this.R) && (this.FUR == this.F) && (this.UFL == this.U) &&
      (this.FLU == this.F) && (this.LUF == this.L) && (this.ULB == this.U) && (this.LBU == this.L) &&
      (this.BUL == this.B) && (this.UBR == this.U) && (this.BRU == this.B) && (this.RUB == this.R) &&
      (this.DFR == this.D) && (this.FRD == this.F) && (this.RDF == this.R) && (this.DLF == this.D) &&
      (this.LFD == this.L) && (this.FDL == this.F) && (this.DBL == this.D) && (this.BLD == this.B) &&
      (this.LDB == this.L) && (this.DRB == this.D) && (this.RBD == this.R) && (this.BDR == this.B));
    };

    return Cub;

  }

  angular.module('nuCubingApp').factory('Cub', CubFactory);

})();
