import SurveyTab from "@/features/dashboard/discover/SurveyTab";
import Title from "../../../../components/ui/Title";

const page = () => {
	return (
		<div>
			<Title as="h2">DISCOVER SURVEYS</Title>
			<SurveyTab />
		</div>
	);
};

export default page;
