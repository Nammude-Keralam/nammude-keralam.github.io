const SUPABASE_URL = "https://ukbdqrvmdrlqqfqbnkle.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Pc7qVHy1ojZFq795l2PmSg_6fm7M6Hf";

const REPORTS_TABLE = "reports";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function exportReportsToExcel() {

    const button = document.getElementById("exportExcelBtn");

    try {

        button.disabled = true;
        button.textContent = "Preparing Excel...";

        const { data, error } = await supabaseClient
            .from(REPORTS_TABLE)
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            alert("No reports found.");
            return;
        }

        const worksheet =
            XLSX.utils.json_to_sheet(data);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Reports"
        );

        XLSX.writeFile(
            workbook,
            "Nammude_Reports.xlsx"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Export failed. Check your Supabase connection."
        );

    } finally {

        button.disabled = false;
        button.textContent = "📊 Export to Excel";

    }
}