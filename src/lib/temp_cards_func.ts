export async function getTreasuryCards() {
    try {
        const { data, error } = await supabaseAdmin
            .from(TREASURY_CARDS_COLLECTION)
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching treasury cards:", error);
        return [];
    }
}
