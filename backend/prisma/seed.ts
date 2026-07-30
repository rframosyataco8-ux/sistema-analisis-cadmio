import { PrismaClient, Role, SampleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================================
// DATOS COMPLETOS DEL EXCEL — Cadmio y plaguicidas en productos
// ============================================================

type Pest = { name: string; value: number };
type SampleSeed = {
  lote: string;
  product: string;
  weight: number;
  cadmium: number | null;
  zones: string[];
  pesticides?: Pest[];
  status?: 'ANALYZED' | 'PENDING_ANALYSIS';
  observation?: string;
};

const SAMPLE_DATA: SampleSeed[] = [
  // ========== TORTA DE CACAO (hoja principal con plaguicidas) ==========
  { lote: '23260205', product: 'Torta de cacao', weight: 1000, cadmium: 1.021, zones: ['Ayacucho', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.013 }, { name: '2,4-D', value: 0.009 }] },
  { lote: '24260207', product: 'Torta de cacao', weight: 1000, cadmium: 1.212, zones: ['Tarapoto', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.016 }] },
  { lote: '25260211', product: 'Torta de cacao', weight: 1000, cadmium: 1.143, zones: ['Tarapoto', 'Jaen'], pesticides: [] },
  { lote: '26260212', product: 'Torta de cacao', weight: 1000, cadmium: 1.043, zones: ['Neshuya', 'Pangoa'], pesticides: [] },
  { lote: '27260213', product: 'Torta de cacao', weight: 1000, cadmium: 1.029, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.057 }, { name: 'Cypermethrin', value: 0.007 }] },
  { lote: '28260214', product: 'Torta de cacao', weight: 1000, cadmium: 1.099, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.043 }, { name: 'Cypermethrin', value: 0.012 }] },
  { lote: '29260214', product: 'Torta de cacao', weight: 1000, cadmium: 1.123, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.054 }, { name: 'Cypermethrin', value: 0.008 }] },
  { lote: '30260216', product: 'Torta de cacao', weight: 1000, cadmium: 1.066, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.017 }, { name: '2,4-D', value: 0.017 }] },
  { lote: '31260216', product: 'Torta de cacao', weight: 1000, cadmium: 1.363, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.080 }] },
  { lote: '32260218', product: 'Torta de cacao', weight: 1000, cadmium: 1.306, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.017 }] },
  { lote: '33260219', product: 'Torta de cacao', weight: 1000, cadmium: 1.116, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.155 }] },
  { lote: '34260220', product: 'Torta de cacao', weight: 1000, cadmium: 1.148, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.35 }] },
  { lote: '35260222', product: 'Torta de cacao', weight: 1000, cadmium: 1.241, zones: ['Neshuya', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.010 }] },
  { lote: '36260223', product: 'Torta de cacao', weight: 1000, cadmium: 1.014, zones: ['Neshuya', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.023 }] },
  { lote: '37260225', product: 'Torta de cacao', weight: 1000, cadmium: 1.05, zones: ['Tarapoto', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.026 }] },
  { lote: '38260227', product: 'Torta de cacao', weight: 1000, cadmium: 0.938, zones: ['Sisa', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.244 }] },
  { lote: '39260228', product: 'Torta de cacao', weight: 1000, cadmium: 0.952, zones: ['Sisa', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.075 }] },
  { lote: '40260302', product: 'Torta de cacao', weight: 1000, cadmium: 0.931, zones: ['Sisa', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.075 }] },
  { lote: '41260302', product: 'Torta de cacao', weight: 1000, cadmium: 0.994, zones: ['Sisa', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.015 }, { name: '2,4-D', value: 0.010 }] },
  { lote: '42260303', product: 'Torta de cacao', weight: 1000, cadmium: 1.031, zones: ['Sisa', 'Jaen'], pesticides: [] },
  { lote: '43260303', product: 'Torta de cacao', weight: 1000, cadmium: 0.98, zones: ['Sisa', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.056 }] },
  { lote: '44260304', product: 'Torta de cacao', weight: 1000, cadmium: 1.015, zones: ['Sisa', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.027 }] },
  { lote: '45260305', product: 'Torta de cacao', weight: 1000, cadmium: 0.866, zones: ['Juanjui'], pesticides: [{ name: '2,4-D', value: 0.004 }, { name: 'Chlorpyrifos', value: 0.008 }] },
  { lote: '21260204', product: 'Torta de cacao', weight: 1000, cadmium: 0.967, zones: ['Juanjui'], pesticides: [{ name: 'Chlorpyrifos', value: 0.023 }, { name: 'Cypermethrin', value: 0.004 }] },
  { lote: '46260305', product: 'Torta de cacao', weight: 1000, cadmium: 0.969, zones: ['Tarapoto', 'Sisa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.042 }, { name: '2,4-D', value: 0.007 }] },
  { lote: '48260316', product: 'Torta de cacao', weight: 1000, cadmium: 1.092, zones: ['Juanjui', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.014 }, { name: 'Chlorpyrifos', value: 0.028 }] },
  { lote: '49260317', product: 'Torta de cacao', weight: 1000, cadmium: 1.074, zones: ['Juanjui', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.014 }, { name: 'Chlorpyrifos', value: 0.054 }] },
  { lote: '50260319', product: 'Torta de cacao', weight: 1000, cadmium: 1.1082, zones: ['Juanjui', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.010 }, { name: 'Chlorpyrifos', value: 0.067 }] },
  { lote: '51260320', product: 'Torta de cacao', weight: 1000, cadmium: 1.1376, zones: ['Juanjui', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.032 }, { name: 'Chlorpyrifos', value: 0.024 }] },
  { lote: '52260321', product: 'Torta de cacao', weight: 1000, cadmium: 1.0618, zones: ['Juanjui', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.021 }, { name: 'Chlorpyrifos', value: 0.057 }] },
  // 300 gr
  { lote: '53260324', product: 'Torta de cacao', weight: 300, cadmium: 0.938, zones: ['Juanjui', 'Jaen'] },
  { lote: '54260325', product: 'Torta de cacao', weight: 300, cadmium: 1.205, zones: ['Neshuya', 'Tocache'] },
  { lote: '55260402', product: 'Torta de cacao', weight: 300, cadmium: 1.0225, zones: ['Juanjui', 'Jaen'] },
  { lote: '56260403', product: 'Torta de cacao', weight: 300, cadmium: 0.9501, zones: ['Tocache', 'Jaen'] },
  { lote: '57260405', product: 'Torta de cacao', weight: 300, cadmium: 1.0698, zones: ['Tingo María', 'Jaen'] },
  { lote: '61260409', product: 'Torta de cacao', weight: 300, cadmium: 2.239, zones: ['Jaen', 'Bagua'] },
  { lote: '62260410', product: 'Torta de cacao', weight: 300, cadmium: 1.785, zones: ['Bagua', 'Ayacucho'] },
  { lote: '63260411', product: 'Torta de cacao', weight: 300, cadmium: 1.381, zones: ['Ayacucho', 'Jaen'] },
  { lote: '64260411', product: 'Torta de cacao', weight: 300, cadmium: 1.375, zones: ['Ayacucho', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.016 }, { name: '2,4-D', value: 0.069 }] },
  { lote: '65260412', product: 'Torta de cacao', weight: 300, cadmium: 1.189, zones: ['Tingo María', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.015 }, { name: '2,4-D', value: 0.046 }, { name: 'Azoxystrobin', value: 0.005 }] },
  { lote: '66260412', product: 'Torta de cacao', weight: 300, cadmium: 1.096, zones: ['Tingo María', 'Tocache'], pesticides: [{ name: 'Chlorpyrifos', value: 0.019 }, { name: '2,4-D', value: 0.040 }] },
  { lote: '67260413', product: 'Torta de cacao', weight: 300, cadmium: 1.33, zones: ['Tocache', 'Tingo María'], pesticides: [{ name: 'Chlorpyrifos', value: 0.052 }, { name: '2,4-D', value: 0.048 }] },
  { lote: '68260418', product: 'Torta de cacao', weight: 300, cadmium: 1.104, zones: ['Tingo María', 'Sisa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.069 }, { name: '2,4-D', value: 0.049 }] },
  { lote: '69260419', product: 'Torta de cacao', weight: 300, cadmium: 1.121, zones: ['Sisa', 'Jaen'], pesticides: [{ name: 'Chlorpyrifos', value: 0.048 }, { name: '2,4-D', value: 0.063 }] },
  { lote: '70260419', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Sisa', 'Yurimaguas'], pesticides: [{ name: '2,4-D', value: 0.018 }, { name: 'Chlorpyrifos', value: 0.214 }], status: 'PENDING_ANALYSIS', observation: 'SIN MUESTRA' },
  { lote: '71260424', product: 'Torta de cacao', weight: 300, cadmium: 1.34, zones: ['Yurimaguas', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.012 }, { name: 'Chlorpyrifos', value: 0.209 }] },
  { lote: '72260424', product: 'Torta de cacao', weight: 300, cadmium: 1.26, zones: ['Jaen', 'Juanjui'], pesticides: [{ name: '2,4-D', value: 0.012 }, { name: 'Chlorpyrifos', value: 0.060 }] },
  { lote: '73260425', product: 'Torta de cacao', weight: 300, cadmium: 1.03, zones: ['Sisa', 'Juanjui'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.021 }] },
  { lote: '74260426', product: 'Torta de cacao', weight: 300, cadmium: 0.97, zones: ['Sisa', 'Juanjui'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.040 }, { name: 'Fipronil', value: 0.003 }] },
  { lote: '75260426', product: 'Torta de cacao', weight: 300, cadmium: 1.02, zones: ['Moyobamba', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.025 }] },
  { lote: '76260427', product: 'Torta de cacao', weight: 300, cadmium: 1.03, zones: ['Moyobamba', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.027 }, { name: '2,4-D', value: 0.033 }, { name: 'DEET', value: 0.0099 }] },
  { lote: '77260428', product: 'Torta de cacao', weight: 300, cadmium: 0.92, zones: ['Tarapoto', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.020 }, { name: 'DEET', value: 0.0099 }] },
  { lote: '78260428', product: 'Torta de cacao', weight: 300, cadmium: 0.9, zones: ['Tarapoto', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.016 }, { name: 'Chlorpyrifos', value: 0.012 }] },
  { lote: '79260429', product: 'Torta de cacao', weight: 300, cadmium: 0.84, zones: ['Tarapoto', 'Chanchamayo'], pesticides: [{ name: '2,4-D', value: 0.017 }, { name: 'Chlorpyrifos', value: 0.012 }] },
  { lote: '80260430', product: 'Torta de cacao', weight: 300, cadmium: 0.93, zones: ['Tarapoto', 'Chanchamayo'], pesticides: [{ name: '2,4-D', value: 0.020 }, { name: 'Chlorpyrifos', value: 0.010 }] },
  { lote: '81260501', product: 'Torta de cacao', weight: 300, cadmium: 0.83, zones: ['Tocache', 'Chanchamayo'], pesticides: [{ name: '2,4-D', value: 0.027 }, { name: 'Chlorpyrifos', value: 0.009 }] },
  { lote: '82260501', product: 'Torta de cacao', weight: 300, cadmium: 1.24, zones: ['Jaen', 'Ayacucho'], pesticides: [{ name: '2,4-D', value: 0.012 }, { name: 'Chlorpyrifos', value: 0.010 }] },
  { lote: '83260503', product: 'Torta de cacao', weight: 300, cadmium: 1.2, zones: ['Ayacucho', 'Neshuya'], pesticides: [{ name: '2,4-D', value: 0.023 }, { name: 'Chlorpyrifos', value: 0.010 }] },
  { lote: '85260504', product: 'Torta de cacao', weight: 300, cadmium: 0.94, zones: ['Ayacucho'], pesticides: [{ name: '2,4-D', value: 0.029 }, { name: 'Chlorpyrifos', value: 0.009 }] },
  { lote: '87260512', product: 'Torta de cacao', weight: 300, cadmium: 1.0, zones: ['Neshuya', 'Chanchamayo'], pesticides: [{ name: 'Chlorpyrifos', value: 0.032 }, { name: '2,4-D', value: 0.007 }] },
  { lote: '88260514', product: 'Torta de cacao', weight: 300, cadmium: 1.02, zones: ['Neshuya', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.009 }, { name: 'Chlorpyrifos', value: 0.004 }] },
  { lote: '89260515', product: 'Torta de cacao', weight: 300, cadmium: 0.82, zones: ['Pangoa', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.014 }, { name: '2,4-D', value: 0.007 }] },
  { lote: '90260516', product: 'Torta de cacao', weight: 300, cadmium: 0.77, zones: ['Pangoa', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.016 }, { name: 'Cypermethrin', value: 0.002 }] },
  { lote: '91260516', product: 'Torta de cacao', weight: 300, cadmium: 0.72, zones: ['Pangoa', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.017 }, { name: 'Cypermethrin', value: 0.002 }] },
  { lote: '92260517', product: 'Torta de cacao', weight: 300, cadmium: 0.78, zones: ['Pangoa', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.014 }] },
  { lote: '93260517', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Pangoa', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.009 }, { name: 'Cypermethrin', value: 0.002 }], status: 'PENDING_ANALYSIS', observation: 'SIN MUESTRA' },
  { lote: '94260518', product: 'Torta de cacao', weight: 300, cadmium: 1.03, zones: ['Pangoa', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.005 }] },
  { lote: '95260518', product: 'Torta de cacao', weight: 301, cadmium: 1.0, zones: ['Ayacucho', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.019 }, { name: 'Chlorpyrifos', value: 0.026 }] },
  { lote: '96260519', product: 'Torta de cacao', weight: 302, cadmium: 1.31, zones: ['Ayacucho', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.014 }, { name: 'Chlorpyrifos', value: 0.020 }] },
  { lote: '97260520', product: 'Torta de cacao', weight: 303, cadmium: 0.69, zones: ['Ayacucho', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.021 }, { name: 'Chlorpyrifos', value: 0.007 }] },
  { lote: '98260521', product: 'Torta de cacao', weight: 300, cadmium: 0.73, zones: ['Ayacucho', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.010 }, { name: '2,4-D', value: 0.008 }] },
  { lote: '100260523', product: 'Torta de cacao', weight: 300, cadmium: 1.06, zones: ['Ayacucho', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.005 }] },
  { lote: '101260524', product: 'Torta de cacao', weight: 300, cadmium: 0.79, zones: ['Tocache', 'Juanjui'] },
  { lote: '102260527', product: 'Torta de cacao', weight: 300, cadmium: 1.39, zones: ['Tocache', 'Chanchamayo'], pesticides: [{ name: 'Chlorpyrifos', value: 0.014 }] },
  { lote: '104260529', product: 'Torta de cacao', weight: 300, cadmium: 1.45, zones: ['Jaen', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '105260531', product: 'Torta de cacao', weight: 300, cadmium: 1.22, zones: ['Jaen', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.021 }] },
  { lote: '106260601', product: 'Torta de cacao', weight: 300, cadmium: 0.98, zones: ['Sisa', 'Jaen'] },
  // Continuación Torta de Cacao (lotes del final del Excel)
  { lote: '103260522', product: 'Torta de cacao', weight: 300, cadmium: 1.48, zones: ['Tingo María', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.022 }, { name: 'Chlorpyrifos', value: 0.006 }] },
  { lote: '108260605', product: 'Torta de cacao', weight: 300, cadmium: 1.25, zones: ['Jaen', 'Ayacucho'], pesticides: [{ name: '2,4-D', value: 0.014 }, { name: 'Chlorpyrifos', value: 0.009 }] },
  { lote: '114260615', product: 'Torta de cacao', weight: 300, cadmium: 0.76, zones: ['Sisa', 'Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '115260616', product: 'Torta de cacao', weight: 300, cadmium: 0.86, zones: ['Ayacucho', 'Quillabamba'], pesticides: [{ name: 'Chlorpyrifos', value: 0.011 }] },
  { lote: '116260618', product: 'Torta de cacao', weight: 300, cadmium: 0.65, zones: ['Ayacucho', 'Quillabamba', 'Sisa', 'Pangoa', 'Chanchamayo'], pesticides: [] },
  { lote: '117260623', product: 'Torta de cacao', weight: 300, cadmium: 0.87, zones: ['Bagua', 'Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.009 }] },
  { lote: '118260624', product: 'Torta de cacao', weight: 300, cadmium: 0.75, zones: ['Jaen', 'Sisa'], pesticides: [{ name: '2,4-D', value: 0.011 }, { name: 'Chlorpyrifos', value: 0.004 }] },
  { lote: '119260625', product: 'Torta de cacao', weight: 300, cadmium: 0.85, zones: ['Pangoa', 'Chanchamayo'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.004 }] },
  { lote: '120260626', product: 'Torta de cacao', weight: 300, cadmium: 0.82, zones: ['Ayacucho', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.009 }] },
  { lote: '121260626', product: 'Torta de cacao', weight: 300, cadmium: 0.97, zones: ['Neshuya', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '122260627', product: 'Torta de cacao', weight: 300, cadmium: 1.24, zones: ['Tarapoto', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.004 }] },
  { lote: '123260628', product: 'Torta de cacao', weight: 300, cadmium: 0.89, zones: ['Sisa', 'Yurimaguas'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '124260629', product: 'Torta de cacao', weight: 300, cadmium: 0.71, zones: ['Ayacucho', 'Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.014 }] },
  { lote: '125260629', product: 'Torta de cacao', weight: 300, cadmium: 1.19, zones: ['Jaen', 'Ayacucho'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '125260630', product: 'Torta de cacao', weight: 300, cadmium: 0.97, zones: ['Ayacucho', 'Jaen'], pesticides: [{ name: '2,4-D', value: 0.018 }, { name: 'Chlorpyrifos', value: 0.011 }] },
  { lote: '126260630', product: 'Torta de cacao', weight: 300, cadmium: 0.95, zones: ['Jaen', 'Tingo María'], pesticides: [{ name: '2,4-D', value: 0.021 }, { name: 'Chlorpyrifos', value: 0.017 }] },
  { lote: '127260701', product: 'Torta de cacao', weight: 300, cadmium: 0.88, zones: ['Jaen', 'Ayacucho'], pesticides: [{ name: 'Chlorpyrifos', value: 0.010 }, { name: '2,4-D', value: 0.012 }] },
  { lote: '128260701', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Tarapoto'], pesticides: [{ name: '2,4-D', value: 0.023 }, { name: 'Chlorpyrifos', value: 0.007 }], status: 'PENDING_ANALYSIS', observation: 'SIN MUESTRA' },
  { lote: '129260703', product: 'Torta de cacao', weight: 300, cadmium: 0.98, zones: ['Jaen', 'Chanchamayo'], pesticides: [{ name: '2,4-D', value: 0.011 }, { name: 'Chlorpyrifos', value: 0.006 }] },
  { lote: '130260708', product: 'Torta de cacao', weight: 300, cadmium: 1.19, zones: ['Jaen', 'Juanjui'], pesticides: [{ name: '2,4-D', value: 0.014 }] },
  { lote: '131260710', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Juanjui', 'Ayacucho', 'Jaen', 'Yurimaguas'], status: 'PENDING_ANALYSIS', observation: 'SIN MUESTRA' },
  { lote: '109260606', product: 'Torta de cacao', weight: 300, cadmium: 0.64, zones: ['Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.019 }, { name: 'Chlorpyrifos', value: 0.049 }] },
  { lote: '110260607', product: 'Torta de cacao', weight: 300, cadmium: 0.59, zones: ['Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.021 }, { name: 'Chlorpyrifos', value: 0.032 }] },
  { lote: '111260610', product: 'Torta de cacao', weight: 300, cadmium: 1.31, zones: ['Bagua', 'Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.074 }, { name: 'Chlorpyrifos', value: 0.0078 }] },
  { lote: '112260611', product: 'Torta de cacao', weight: 300, cadmium: 1.04, zones: ['Pangoa', 'Jaen'], pesticides: [{ name: 'Azoxystrobin', value: 0.005 }, { name: '2,4-D', value: 0.13 }] },
  { lote: '113260612', product: 'Torta de cacao', weight: 300, cadmium: 1.02, zones: ['Neshuya', 'Pangoa'] },
  { lote: '132260719', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Juanjui', 'Tarapoto'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.012 }], status: 'PENDING_ANALYSIS' },
  { lote: '133260722', product: 'Torta de cacao', weight: 300, cadmium: null, zones: ['Juanjui', 'Tarapoto'], pesticides: [{ name: '2,4-D', value: 0.098 }], status: 'PENDING_ANALYSIS' },

  // ========== TORTA TROZADA ESTÁNDAR ==========
  { lote: '103260522-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Tingo María', 'Jaen', 'Juanjui'], pesticides: [{ name: '2,4-D', value: 0.022 }, { name: 'Chlorpyrifos', value: 0.006 }] },
  { lote: '108260605-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Jaen', 'Ayacucho', 'Bagua'], pesticides: [{ name: '2,4-D', value: 0.014 }, { name: 'Chlorpyrifos', value: 0.009 }] },
  { lote: '114260615-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Sisa', 'Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '115260616-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Ayacucho', 'Quillabamba', 'Jaen', 'Sisa', 'Pangoa'], pesticides: [{ name: 'Chlorpyrifos', value: 0.011 }] },
  { lote: '116260618-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Ayacucho', 'Quillabamba', 'Sisa', 'Pangoa', 'Chanchamayo'], pesticides: [] },
  { lote: '117260623-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Bagua', 'Quillabamba', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.009 }] },
  { lote: '118260624-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Jaen', 'Sisa', 'Pangoa', 'Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.011 }, { name: 'Chlorpyrifos', value: 0.004 }] },
  { lote: '119260625-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Pangoa', 'Chanchamayo', 'Bagua', 'Sisa'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.004 }] },
  { lote: '120260626-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Ayacucho', 'Jaen', 'Quillabamba', 'Sisa'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.009 }] },
  { lote: '121260626-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Neshuya', 'Jaen', 'Bagua', 'Quillabamba'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '122260627-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Tarapoto', 'Jaen', 'Sisa', 'Quillabamba', 'Neshuya'], pesticides: [{ name: '2,4-D', value: 0.013 }, { name: 'Chlorpyrifos', value: 0.004 }] },
  { lote: '123260628-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Sisa', 'Yurimaguas', 'Quillabamba', 'Ayacucho'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '124260629-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Ayacucho', 'Quillabamba', 'Neshuya', 'Bagua'], pesticides: [{ name: '2,4-D', value: 0.014 }] },
  { lote: '125260629-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Jaen', 'Ayacucho', 'Tingo María', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.010 }] },
  { lote: '125260630-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Ayacucho', 'Jaen', 'Quillabamba', 'Sisa', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.018 }, { name: 'Chlorpyrifos', value: 0.011 }] },
  { lote: '126260630-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Jaen', 'Tingo María', 'Juanjui', 'Quillabamba', 'Pangoa'], pesticides: [{ name: '2,4-D', value: 0.021 }, { name: 'Chlorpyrifos', value: 0.017 }] },
  { lote: '127260701-TT', product: 'Torta trozada estándar', weight: 10, cadmium: null, zones: ['Jaen', 'Ayacucho', 'Quillabamba'], pesticides: [{ name: 'Chlorpyrifos', value: 0.010 }, { name: '2,4-D', value: 0.012 }] },

  // ========== TORTA DE CACAO ALCALINO ==========
  { lote: '22260511', product: 'Torta de cacao alcalino', weight: 300, cadmium: 0.96, zones: ['Tingo María', 'Sisa'] },
  { lote: '23260515', product: 'Torta de cacao alcalino', weight: 300, cadmium: 0.82, zones: ['Tarapoto', 'Chanchamayo', 'Tocache'] },
  { lote: '24260518', product: 'Torta de cacao alcalino', weight: 300, cadmium: 1.05, zones: ['Tarapoto', 'Pangoa', 'Chanchamayo', 'Bagua', 'Jaen'] },
  { lote: '25260520', product: 'Torta de cacao alcalino', weight: 300, cadmium: null, zones: ['Bagua', 'Jaen', 'Pangoa'], status: 'PENDING_ANALYSIS', observation: 'SIN MUESTRA' },
  { lote: '18260418', product: 'Torta de cacao alcalino', weight: 300, cadmium: 1.08, zones: [] },

  // ========== GRANO DE CACAO ==========
  { lote: '061-123', product: 'Grano de cacao', weight: 350, cadmium: 0.45, zones: ['Neshuya'] },
  { lote: 'EG07-2977', product: 'Grano de cacao', weight: 350, cadmium: 0.37, zones: ['Ayacucho'] },
  { lote: 'EG07-2978', product: 'Grano de cacao', weight: 350, cadmium: 0.35, zones: ['Ayacucho'] },
  { lote: 'C-1', product: 'Grano de cacao', weight: 350, cadmium: 0.37, zones: ['Yarina'] },
  { lote: 'C-3', product: 'Grano de cacao', weight: 350, cadmium: 0.4, zones: ['Yarina'] },
  { lote: 'C-4', product: 'Grano de cacao', weight: 350, cadmium: 0.41, zones: ['Yarina'] },
  { lote: 'C-5', product: 'Grano de cacao', weight: 350, cadmium: 0.35, zones: ['Yarina'] },
  { lote: 'C-6', product: 'Grano de cacao', weight: 350, cadmium: 0.35, zones: ['Yarina'] },
  { lote: '061-125', product: 'Grano de cacao', weight: 350, cadmium: 0.41, zones: ['Neshuya'] },
  { lote: 'EG07-3006', product: 'Grano de cacao', weight: 350, cadmium: 0.3, zones: ['Ayacucho'] },
  { lote: 'EG07-3008', product: 'Grano de cacao', weight: 350, cadmium: 0.34, zones: ['Ayacucho'] },
  { lote: 'EG07-3038', product: 'Grano de cacao', weight: 350, cadmium: 0.35, zones: ['Ayacucho'] },
  { lote: 'EG07-3039', product: 'Grano de cacao', weight: 350, cadmium: 0.42, zones: ['Ayacucho'] },
  { lote: '049-187', product: 'Grano de cacao', weight: 350, cadmium: 0.59, zones: ['Pangoa', 'Chanchamayo'] },
  { lote: 'EG07-3053', product: 'Grano de cacao', weight: 350, cadmium: 0.21, zones: ['Ayacucho'] },
  { lote: 'EG07-3059', product: 'Grano de cacao', weight: 350, cadmium: 0.21, zones: ['Quillabamba'] },
  { lote: 'EG07-06', product: 'Grano de cacao', weight: 350, cadmium: 0.79, zones: ['Campoverde'] },
  { lote: 'EG07-07', product: 'Grano de cacao', weight: 350, cadmium: 0.46, zones: ['Campoverde'] },
  { lote: 'EG07-3064', product: 'Grano de cacao', weight: 350, cadmium: 0.32, zones: ['Ayacucho'] },
  { lote: 'EG07-10', product: 'Grano de cacao', weight: 350, cadmium: 0.57, zones: ['Campoverde'] },
  { lote: 'EG07-11', product: 'Grano de cacao', weight: 350, cadmium: 0.5, zones: ['Campoverde'] },
  { lote: 'EG07-3075', product: 'Grano de cacao', weight: 350, cadmium: 0.36, zones: ['Ayacucho'] },
  { lote: 'EG07-3098', product: 'Grano de cacao', weight: 350, cadmium: 0.31, zones: ['Ayacucho'] },
  { lote: 'EG07-3124', product: 'Grano de cacao', weight: 350, cadmium: 0.15, zones: ['Quillabamba'] },
  { lote: 'EG07-3028', product: 'Grano de cacao', weight: 350, cadmium: 0.85, zones: ['Yurimaguas'] },
  { lote: 'EG07-3089', product: 'Grano de cacao', weight: 350, cadmium: 0.11, zones: ['Quillabamba'] },
  { lote: 'EG07-3027', product: 'Grano de cacao', weight: 350, cadmium: 0.62, zones: ['Tarapoto'] },
  { lote: 'EG07-3030', product: 'Grano de cacao', weight: 350, cadmium: 0.33, zones: ['Tarapoto'] },
  { lote: 'EG07-3153', product: 'Grano de cacao', weight: 350, cadmium: 0.56, zones: ['Jaen'] },
  { lote: 'EG07-3193', product: 'Grano de cacao', weight: 350, cadmium: 0.85, zones: ['Bagua'] },
  { lote: 'EG07-3300', product: 'Grano de cacao', weight: 350, cadmium: 0.53, zones: ['Juanjui'] },
  { lote: 'T01-05', product: 'Grano de cacao orgánico', weight: 350, cadmium: 0.44, zones: ['Campoverde'] },
  { lote: 'EG07-3298', product: 'Grano de cacao', weight: 350, cadmium: 0.7, zones: ['Yurimaguas'] },
  { lote: 'EG07-3270', product: 'Grano de cacao', weight: 350, cadmium: 0.31, zones: ['Ayacucho'] },
  { lote: 'EG07-3261', product: 'Grano de cacao', weight: 350, cadmium: 0.44, zones: ['Yurimaguas'] },
  { lote: 'T01-07', product: 'Grano de cacao orgánico', weight: 350, cadmium: 0.51, zones: ['Campoverde'] },
  { lote: 'T01-06', product: 'Grano de cacao orgánico', weight: 350, cadmium: 0.6, zones: ['Campoverde'] },
  { lote: 'EG07-3255', product: 'Grano de cacao', weight: 350, cadmium: 0.48, zones: ['Sisa'] },
  { lote: '068-09', product: 'Grano de cacao', weight: 350, cadmium: 0.65, zones: ['Constitución'] },
  { lote: 'EG07-3367', product: 'Grano de cacao', weight: 350, cadmium: 0.35, zones: ['Bagua'] },
  { lote: '061-148', product: 'Grano de cacao', weight: 350, cadmium: 0.76, zones: ['Neshuya'] },
  { lote: '061-147', product: 'Grano de cacao', weight: 350, cadmium: 0.58, zones: ['Neshuya'] },
  { lote: 'EG07-3371', product: 'Grano de cacao', weight: 350, cadmium: 0.86, zones: ['Jaen'] },
  { lote: 'EG07-3347', product: 'Grano de cacao', weight: 350, cadmium: 0.14, zones: ['Quillabamba'] },
  { lote: 'EG07-3519', product: 'Grano de cacao', weight: 350, cadmium: 0.41, zones: ['Ayacucho'] },
  { lote: 'EG07-3498', product: 'Grano de cacao', weight: 350, cadmium: 0.46, zones: ['Neshuya'] },
  { lote: 'EG07-3499', product: 'Grano de cacao', weight: 350, cadmium: 0.46, zones: ['Neshuya'] },
  { lote: 'EG07-3517', product: 'Grano de cacao', weight: 350, cadmium: null, zones: ['Constitución'], status: 'PENDING_ANALYSIS', observation: 'SIN MUESTRA' },
  { lote: 'EG07-3544', product: 'Grano de cacao', weight: 350, cadmium: 0.12, zones: ['Quillabamba'] },
  { lote: 'EG07-3504', product: 'Grano de cacao', weight: 350, cadmium: 0.47, zones: ['Jaen'] },
  { lote: 'EG07-3545', product: 'Grano de cacao', weight: 350, cadmium: 0.15, zones: ['Quillabamba'] },
  { lote: 'EG07-3546', product: 'Grano de cacao', weight: 350, cadmium: 0.66, zones: ['Ayacucho'] },
  { lote: 'EG07-3609', product: 'Grano de cacao', weight: 350, cadmium: 0.34, zones: ['Ayacucho'] },

  // ========== CACAO ALCALINO REDUCIDO EN GRASA ==========
  { lote: '12260417', product: 'Cacao alcalino', weight: 300, cadmium: 1.02, zones: ['Sisa', 'Jaen', 'Tarapoto', 'Tingo María'] },
  { lote: '13260420', product: 'Cacao alcalino', weight: 300, cadmium: 1.09, zones: ['Sisa', 'Jaen', 'Tarapoto', 'Tingo María'] },

  // ========== CACAO EN POLVO ==========
  { lote: '14260526', product: 'Cacao en polvo', weight: 300, cadmium: 0.98, zones: [] },
  { lote: '11260513', product: 'Cacao en polvo', weight: 300, cadmium: 1.07, zones: [] },
  { lote: '12260522', product: 'Cacao en polvo', weight: 300, cadmium: 0.79, zones: [] },
  { lote: '15260527', product: 'Cacao en polvo', weight: 300, cadmium: 0.98, zones: ['Jaen', 'Campoverde', 'Ayacucho', 'Quillabamba', 'Tingo María', 'Yurimaguas'] },
  { lote: '16260706', product: 'Cacao en polvo', weight: 300, cadmium: 1.12, zones: ['Jaen', 'Yurimaguas', 'Neshuya', 'Constitución'] },
  { lote: '17260709', product: 'Cacao en polvo', weight: 300, cadmium: 1.15, zones: ['Neshuya', 'Jaen', 'Constitución', 'Juanjui'] },
  { lote: '18260712', product: 'Cacao en polvo', weight: 300, cadmium: 0.9, zones: ['Constitución', 'Campoverde', 'Ayacucho', 'Sisa', 'Juanjui'] },
];

async function main() {
  console.log('🌱 Seeding completo del Excel...');

  const adminPass = await bcrypt.hash('Admin123!', 12);
  const analistaPass = await bcrypt.hash('Analista123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@romex.pe' },
    update: {},
    create: { email: 'admin@romex.pe', passwordHash: adminPass, fullName: 'Administrador Chincha', role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'lima@romex.pe' },
    update: {},
    create: { email: 'lima@romex.pe', passwordHash: analistaPass, fullName: 'Analista Lima', role: Role.ANALISTA },
  });

  // Productos (cada hoja del Excel)
  const products = [
    { name: 'Torta de cacao', code: 'TORTA', hasPesticides: true },
    { name: 'Torta trozada estándar', code: 'TROZADA', hasPesticides: true },
    { name: 'Torta de cacao alcalino', code: 'TORTA_ALC', hasPesticides: false },
    { name: 'Grano de cacao', code: 'GRANO', hasPesticides: false },
    { name: 'Grano de cacao orgánico', code: 'GRANO_ORG', hasPesticides: false },
    { name: 'Cacao alcalino', code: 'ALC', hasPesticides: false },
    { name: 'Cacao en polvo', code: 'POLVO', hasPesticides: false },
  ];

  const productMap: Record<string, string> = {};
  for (const p of products) {
    const created = await prisma.productType.upsert({
      where: { name: p.name },
      update: { code: p.code, hasPesticides: p.hasPesticides },
      create: { name: p.name, code: p.code, hasPesticides: p.hasPesticides },
    });
    productMap[p.name] = created.id;
  }

  // Zonas
  const zoneNames = [
    'Ayacucho', 'Jaen', 'Tarapoto', 'Neshuya', 'Pangoa', 'Tingo María', 'Sisa', 'Bagua',
    'Quillabamba', 'Juanjui', 'Yurimaguas', 'Chanchamayo', 'Tocache', 'Moyobamba',
    'Campoverde', 'Yarina', 'Constitución',
  ];
  const zoneMap: Record<string, string> = {};
  for (const name of zoneNames) {
    const z = await prisma.zone.upsert({ where: { name }, update: {}, create: { name } });
    zoneMap[name] = z.id;
  }

  // Limpiar muestras anteriores para re-seed limpio (opcional, comentar si no se desea)
  // await prisma.pesticide.deleteMany();
  // await prisma.sampleOrigin.deleteMany();
  // await prisma.sample.deleteMany();

  let created = 0;
  let skipped = 0;

  for (const s of SAMPLE_DATA) {
    const existing = await prisma.sample.findFirst({ where: { loteCode: s.lote } });
    if (existing) {
      skipped++;
      continue;
    }

    const productId = productMap[s.product];
    if (!productId) {
      console.warn(`Producto no encontrado: ${s.product}`);
      continue;
    }

    const status = s.status === 'PENDING_ANALYSIS' || s.cadmium == null
      ? SampleStatus.PENDING_ANALYSIS
      : SampleStatus.ANALYZED;

    await prisma.sample.create({
      data: {
        loteCode: s.lote,
        productTypeId: productId,
        weight: s.weight,
        producerCode: 'Chincha',
        producerName: 'Exportadora Romex S.A',
        cadmium: s.cadmium,
        status,
        analyzedAt: s.cadmium != null ? new Date() : null,
        observationCadmium: s.observation ?? null,
        createdById: admin.id,
        origins: {
          create: s.zones
            .filter((z) => zoneMap[z])
            .map((z) => ({ zoneId: zoneMap[z] })),
        },
        pesticides: s.pesticides?.length
          ? {
              create: s.pesticides.map((p) => ({
                name: p.name,
                value: p.value,
                unit: 'mg/kg',
              })),
            }
          : undefined,
      },
    });
    created++;
  }

  console.log(`\n✅ Seed OK`);
  console.log(`   Admin: admin@romex.pe / Admin123!`);
  console.log(`   Analista: lima@romex.pe / Analista123!`);
  console.log(`   Muestras creadas: ${created}`);
  console.log(`   Ya existían (omitidas): ${skipped}`);
  console.log(`   Productos: ${products.length}`);
  console.log(`   Zonas: ${zoneNames.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
