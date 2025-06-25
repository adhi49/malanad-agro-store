import { useEffect, useState } from "react"
import { Box, Typography, Grid, Card, CardContent, Chip } from "@mui/material"
import { getPendingRentOrders } from "../../../api/order"
const RentedItemsListCard = () => {


    const [pendingSells, setPendingSells] = useState([])

    useEffect(() => {
        fetchAllPendingSells()
    }, [])
    const fetchAllPendingSells = async () => {
        try {
            const result = await getPendingRentOrders();
            const onlySellOrders = result?.filter(sell => sell.orderType === "Sell");
            console.log("Fetched pending rent orders:", result);
            setPendingSells(onlySellOrders || []);
        } catch (error) {
            console.error("Error fetching rent orders:", error);
        }
    };
    return (
        <Box p={3}>
            <Typography variant="h5" mb={2} fontWeight={600}> pending Sell Orders</Typography>

            <Grid container spacing={3}>
                {pendingSells.map((sell, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined"
                            sx={{
                                width: 250,
                                height: 260,
                                borderRadius: 2,
                                boxShadow: 1,
                                transition: "0.3s",
                                "&:hover": {
                                    boxShadow: 4,
                                },
                            }}>

                            <CardContent>
                                <Box mb={1}>
                                    <Chip
                                        label={sell.orderStatus}
                                        color={sell.orderStatus === "ORDER_PENDING" ? "warning" : "success"}
                                        size="small"

                                    />
                                </Box>
                                <Typography variant="h6" gutterBottom fontWeight={300}>
                                    {sell.inventoryName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Created At: {new Date(sell.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="h7" gutterBottom>
                                    {sell.customerName}
                                </Typography>

                                <Typography variant="body2">
                                    Total Price: ₹{sell.price * sell.quantity}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
export default RentedItemsListCard