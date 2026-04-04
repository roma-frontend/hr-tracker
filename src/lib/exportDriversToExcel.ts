/**
 * Export driver trips to Excel
 */

import ExcelJS from 'exceljs';

interface TripData {
  date: string;
  driver: string;
  passenger: string;
  from: string;
  to: string;
  purpose: string;
  distanceKm: number;
  durationMin: number;
  status: string;
}

export async function exportTripsToExcel(trips: TripData[], filename: string = 'driver-trips.xlsx') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Trips');

  // Add headers with bold styling
  const headers = [
    'Date',
    'Driver',
    'Passenger',
    'From',
    'To',
    'Purpose',
    'Distance (km)',
    'Duration (min)',
    'Status',
  ];

  // Set column headers
  worksheet.columns = headers.map((header) => ({
    header,
    key: header.toLowerCase().replace(/\s\(.*\)/g, '').replace(/\s/g, '_'),
    width: 20,
  }));

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add trip data
  trips.forEach((trip) => {
    worksheet.addRow({
      date: trip.date,
      driver: trip.driver,
      passenger: trip.passenger,
      from: trip.from,
      to: trip.to,
      purpose: trip.purpose,
      distance_km: trip.distanceKm,
      duration_min: trip.durationMin,
      status: trip.status,
    });
  });

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();

  // Create blob and download
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);

  return { success: true, message: 'Excel file downloaded' };
}

export function exportTripsToCSV(trips: TripData[], filename: string = 'driver-trips.csv') {
  const headers = [
    'Date',
    'Driver',
    'Passenger',
    'From',
    'To',
    'Purpose',
    'Distance (km)',
    'Duration (min)',
    'Status',
  ];

  const csv = [
    headers.join(','),
    ...trips.map((trip) =>
      [
        trip.date,
        trip.driver,
        trip.passenger,
        trip.from,
        trip.to,
        trip.purpose,
        trip.distanceKm,
        trip.durationMin,
        trip.status,
      ].join(','),
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);

  return { success: true, message: 'CSV file downloaded' };
}
