import React, { useEffect, useState } from "react";
import RadioButton from "../../common/radio-button";
import {
  bankAccount,
  statusEnum,
  yesNoOption,
} from "../../../constants/constants";
import Modal from "../../common/modal/Modal";
import { getBankAccounts } from "../../../apis/all-masters/accounts";
import { IBankAccount } from "../all-masters/accounts";
import { IOption } from "../../../types/common-types";
import { updateCompanyDetails } from "../../../apis/company/company.api";

interface InvoiceSettingsFormData {
  accountId: string;
  generateInvoiceWithGST: string;
}

interface IAccountDetailEditModelProps {
  accountDetails: InvoiceSettingsFormData;
  isOpen: boolean;
  companyId: string;
  fetchCompanyDetails: () => void;
  handleAccountClose: () => void;
}

const AccountDetailEditModel: React.FC<IAccountDetailEditModelProps> = ({
  accountDetails,
  companyId,
  isOpen,
  handleAccountClose,
  fetchCompanyDetails
}: IAccountDetailEditModelProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<InvoiceSettingsFormData>({
    accountId: "",
    generateInvoiceWithGST: "NO",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof InvoiceSettingsFormData, string>>
  >({});

  const [bankAccounts, setBankAccounts] = useState<IOption[]>([]);

  useEffect(() => {
    if (accountDetails.accountId) {
      setFormData(accountDetails);
      getBankAccountList();
    }
  }, [accountDetails.accountId]);

  // get all bank accounts
  const getBankAccountList = async () => {
    const response = await getBankAccounts(statusEnum.ACTIVE);
    if (response.success) {
      const options = response?.data?.map((ele: IBankAccount) => ({
        value: ele?._id,
        label: `${bankAccount[ele.accountType]} | ${ele.accountNo}`,
      }));
      setBankAccounts(options);
    } else {
      setBankAccounts([]);
    }
  };

  const handleChange = (name: keyof InvoiceSettingsFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof InvoiceSettingsFormData, string>> =
      {};

    if (!formData.accountId) {
      newErrors.accountId = "Account is required";
    }

    if (!formData.generateInvoiceWithGST) {
      newErrors.generateInvoiceWithGST = "Please select GST option";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    const payload = new FormData();
    payload.append("accountId",formData.accountId);
    payload.append("generateInvoiceWithGST",formData.generateInvoiceWithGST === "YES" ? "true": "false");

    const response = await updateCompanyDetails(payload, companyId);
        if(response.success){
          setLoading(false);
          handleClose();
          fetchCompanyDetails();
        }
  };

  // handle close account model
  const handleClose = () => {
    handleAccountClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      title={"Account Details"}
      onClose={handleClose}
      handleOnConfirm={handleSubmit}
      loading={loading}
    >
      <form className="">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account For Invoice */}
          <div className="md:col-span-2">
            <RadioButton
              label="Account For Invoice"
              name="accountId"
              required
              value={formData.accountId}
              error={errors.accountId}
              options={bankAccounts}
              onChange={(value) => handleChange("accountId", value)}
            />
          </div>

          {/* GST Option */}
          <div>
            <RadioButton
              label="Generate Invoice with GST ?"
              name="generateInvoiceWithGST"
              required
              value={formData.generateInvoiceWithGST}
              error={errors.generateInvoiceWithGST}
              options={yesNoOption}
              onChange={(value) =>
                handleChange("generateInvoiceWithGST", value)
              }
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AccountDetailEditModel;
