import { useCallback } from 'react';

import { Patient, useClinic } from '../context/ClinicContext';
import { useMedications } from '../context/MedicationsContext';
import { firstName } from '../utils/clinic';

/** Resets the medication wizard so its final save adds the medication to this patient's file. */
export function useStartPrescription() {
  const { startNew } = useMedications();
  const { addPatientMedication } = useClinic();
  return useCallback(
    (patient: Patient) =>
      startNew('manual', {
        patientId: patient.id,
        patientName: firstName(patient.name),
        onSave: (draft) => addPatientMedication(patient.id, draft),
      }),
    [startNew, addPatientMedication]
  );
}
