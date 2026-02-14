import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseSessionFromExcel } from '../utils/calculations';

export default function UploadView({ setSessionData, plantGrowth, setPlantGrowth }) {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length > 0) {
          setSessionData({
            session1: parseSessionFromExcel(jsonData[0], 'S1'),
            session6: parseSessionFromExcel(jsonData[0], 'S6'),
            session12: parseSessionFromExcel(jsonData[0], 'S12'),
          });
          setPlantGrowth(Math.min(100, plantGrowth + 20));
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Having trouble reading that file. Make sure it follows the Embodied Intelligence Biomarker template!');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/50">
        <h3 className="text-2xl text-amber-900 font-light mb-6" style={{fontFamily: 'Spectral, serif'}}>
          Upload Your Tracking Data
        </h3>

        <div className="border-2 border-dashed border-orange-300 rounded-2xl p-12 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-orange-400 transition-all group">
          <Upload className="w-16 h-16 text-orange-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
          <p className="text-lg font-medium text-amber-900 mb-2 text-center" style={{fontFamily: 'Work Sans, sans-serif'}}>
            Drop your Excel file here
          </p>
          <p className="text-sm text-amber-700 mb-6 text-center" style={{fontFamily: 'Work Sans, sans-serif'}}>
            or click to browse
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="w-full p-4 border-2 border-orange-200 rounded-xl bg-white hover:border-orange-400 transition-all cursor-pointer"
            style={{fontFamily: 'Work Sans, sans-serif'}}
          />
        </div>

        <div className="mt-8 p-6 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl">
          <p className="text-sm text-amber-800 text-center" style={{fontFamily: 'Work Sans, sans-serif'}}>
            Use the Embodied Intelligence Biomarker template with columns for all metrics across Sessions 1, 6, and 12
          </p>
        </div>
      </div>
    </div>
  );
}
